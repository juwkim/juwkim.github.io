// 블로그 댓글 클라이언트 (Firebase Auth + Cloud Firestore Lite)
// 저장 구조와 검증 조건은 저장소 루트의 firestore.rules와 반드시 같아야 합니다.
// 경로: posts/{postKey}/comments/{commentId}
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore/lite';

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export type CommentProvider = 'google' | 'github';

export interface CommentItem {
  id: string;
  /** 최상위 댓글이면 null, 답글이면 부모 댓글 id */
  parentId: string | null;
  uid: string;
  authorName: string;
  authorPhoto: string;
  provider: CommentProvider;
  /** 관리자(블로그 주인)가 쓴 댓글인지. 보안 규칙이 작성 시점에 검증합니다. */
  isOwner: boolean;
  body: string;
  /** 답글이 남아 있는 상태로 지운 최상위 댓글(자리 표시) */
  deleted: boolean;
  /** epoch ms */
  createdAt: number | null;
  /** epoch ms, 수정한 적 없으면 null */
  updatedAt: number | null;
}

export interface CommentUser {
  uid: string;
  name: string;
  photo: string;
  provider: CommentProvider;
  isAdmin: boolean;
}

export interface DeleteOptions {
  /** 답글이 달린 최상위 댓글이면 true: 내용만 지우고 자리를 남깁니다. */
  hasReplies: boolean;
  /** 지운 답글이 삭제된 부모의 마지막 답글이면 부모 자리 표시도 함께 정리합니다(실패해도 무시). */
  cleanupParentId?: string | null;
}

export interface DeleteResult {
  mode: 'soft' | 'hard';
  /** cleanupParentId로 넘긴 부모 자리 표시를 실제로 지웠는지 */
  parentRemoved: boolean;
}

export interface CommentsClient {
  /** 리다이렉트 로그인에서 돌아온 경우의 결과. 오류가 있으면 한국어 메시지로 reject 됩니다. */
  redirectResult(): Promise<CommentUser | null>;
  currentUser(): CommentUser | null;
  /** 로그인 상태가 정해지면(처음 한 번 포함) 호출됩니다. 해제 함수를 반환합니다. */
  onUserChange(callback: (user: CommentUser | null) => void): () => void;
  /** 팝업 로그인. 사용자가 창을 닫으면 null, 팝업이 막히면 리다이렉트로 전환합니다. */
  signIn(provider: CommentProvider): Promise<CommentUser | null>;
  signOut(): Promise<void>;
  loadComments(postKey: string): Promise<CommentItem[]>;
  createComment(postKey: string, body: string, parentId?: string | null): Promise<CommentItem>;
  editComment(postKey: string, commentId: string, body: string): Promise<{ body: string; updatedAt: number }>;
  deleteComment(postKey: string, commentId: string, opts: DeleteOptions): Promise<DeleteResult>;
}

export const BODY_MAX = 2000;
export const REDIRECT_FLAG = 'fb_auth_redirect';
const NAME_MAX = 60;
const PHOTO_MAX = 500;
const POST_KEY_MAX = 180;
const LOAD_LIMIT = 200;

/** 글 주소를 Firestore 문서 id로 쓸 수 있는 키로 바꿉니다. 예: /cs/ai/foo/ → cs__ai__foo */
export function postKeyOf(pathname: string): string {
  const key = pathname
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '__')
    .slice(0, POST_KEY_MAX);
  return key || 'root';
}

// ---------- 오류 메시지 ----------

const ERROR_MESSAGES: Record<string, string> = {
  'auth/account-exists-with-different-credential':
    '이미 다른 로그인 방식(Google 또는 GitHub)으로 가입된 이메일입니다. 기존에 사용하신 방식으로 로그인해 주세요.',
  'auth/unauthorized-domain':
    '현재 주소에서는 로그인할 수 없습니다. 블로그 주소에서 다시 시도해 주세요. (Firebase 승인된 도메인 설정 필요)',
  'auth/operation-not-allowed': '이 로그인 방식은 아직 사용할 수 없습니다.',
  'auth/user-disabled': '사용이 중지된 계정입니다.',
  'auth/network-request-failed': '네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
  'auth/too-many-requests': '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  'auth/web-storage-unsupported': '브라우저 저장소가 막혀 있어 로그인할 수 없습니다. 쿠키와 사이트 데이터 설정을 확인해 주세요.',
  'permission-denied': '권한이 없어 요청을 처리하지 못했습니다. 페이지를 새로 고친 뒤 다시 시도해 주세요.',
  unauthenticated: '로그인이 필요합니다. 다시 로그인해 주세요.',
  'not-found': '이미 삭제되었거나 찾을 수 없는 댓글입니다.',
  unavailable: '댓글 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
  'deadline-exceeded': '응답이 늦어지고 있습니다. 잠시 후 다시 시도해 주세요.',
  'resource-exhausted': '오늘 사용할 수 있는 댓글 요청량을 모두 썼습니다. 내일 다시 시도해 주세요.',
};
const FALLBACK_MESSAGE = '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';

const codeOf = (e: unknown): string =>
  typeof e === 'object' && e !== null && 'code' in e && typeof e.code === 'string' ? e.code : '';

/** Firebase 오류를 사용자에게 보여 줄 한국어 메시지의 Error로 바꿉니다. 직접 만든 검증 오류는 그대로 둡니다. */
function friendlyError(e: unknown): Error {
  const code = codeOf(e);
  if (code && Object.hasOwn(ERROR_MESSAGES, code)) return new Error(ERROR_MESSAGES[code], { cause: e });
  if (!code && e instanceof Error) return e;
  return new Error(FALLBACK_MESSAGE, { cause: e });
}

async function friendly<T>(task: () => Promise<T>): Promise<T> {
  try {
    return await task();
  } catch (e) {
    throw friendlyError(e);
  }
}

// ---------- 값 정리 ----------

/** 서로게이트 쌍이 잘리지 않게 글자 단위로 자릅니다. */
const truncate = (value: string, max: number): string => {
  const chars = Array.from(value);
  return chars.length > max ? chars.slice(0, max).join('') : value;
};

const cleanBody = (body: string): string => {
  const trimmed = body.trim();
  if (!trimmed) throw new Error('내용을 입력해 주세요.');
  if (trimmed.length > BODY_MAX) throw new Error(`댓글은 ${BODY_MAX.toLocaleString()}자까지 쓸 수 있습니다.`);
  return trimmed;
};

const authorNameOf = (user: User): string =>
  truncate((user.displayName || user.email?.split('@')[0] || '사용자').trim(), NAME_MAX).trim() || '사용자';

const authorPhotoOf = (user: User): string =>
  user.photoURL && /^https:\/\//.test(user.photoURL) && user.photoURL.length <= PHOTO_MAX ? user.photoURL : '';

/** 연결된 로그인 방식 중 처음 만나는 Google/GitHub를 고릅니다. 기본값은 google. */
export function resolveProvider(user: User): CommentProvider {
  for (const { providerId } of user.providerData) {
    if (providerId === 'github.com') return 'github';
    if (providerId === 'google.com') return 'google';
  }
  return 'google';
}

const asString = (v: unknown): string => (typeof v === 'string' ? v : '');
const asMillis = (v: unknown): number | null => (v instanceof Timestamp ? v.toMillis() : null);

const toCommentItem = (id: string, data: DocumentData): CommentItem => ({
  id,
  parentId: typeof data.parentId === 'string' ? data.parentId : null,
  uid: asString(data.uid),
  authorName: asString(data.authorName),
  authorPhoto: asString(data.authorPhoto),
  provider: data.provider === 'github' ? 'github' : 'google',
  isOwner: data.isOwner === true,
  body: asString(data.body),
  deleted: data.deleted === true,
  createdAt: asMillis(data.createdAt),
  updatedAt: asMillis(data.updatedAt),
});

// sessionStorage는 사생활 보호 모드 등에서 예외를 던질 수 있어 감쌉니다.
const setRedirectFlag = () => {
  try {
    sessionStorage.setItem(REDIRECT_FLAG, '1');
  } catch {
    // 저장소를 쓸 수 없으면 돌아온 뒤 화면에 가까워질 때 초기화됩니다.
  }
};
const clearRedirectFlag = () => {
  try {
    sessionStorage.removeItem(REDIRECT_FLAG);
  } catch {
    // 무시
  }
};

// ---------- 클라이언트 ----------

export function createCommentsClient(config: FirebaseWebConfig, adminEmail: string): CommentsClient {
  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  auth.languageCode = 'ko';
  const db = getFirestore(app);

  const commentsOf = (postKey: string) => collection(db, 'posts', postKey, 'comments');
  const commentRef = (postKey: string, commentId: string) => doc(db, 'posts', postKey, 'comments', commentId);

  const isUserAdmin = (user: User | null): boolean => Boolean(user && user.emailVerified && user.email === adminEmail);

  const toCommentUser = (user: User): CommentUser => ({
    uid: user.uid,
    name: authorNameOf(user),
    photo: authorPhotoOf(user),
    provider: resolveProvider(user),
    isAdmin: isUserAdmin(user),
  });

  const requireUser = (): User => {
    const user = auth.currentUser;
    if (!user) throw new Error('로그인이 필요합니다.');
    return user;
  };

  // 리다이렉트 로그인에서 돌아온 결과를 초기화 시점에 한 번 처리합니다.
  const redirect = getRedirectResult(auth)
    .then((cred) => (cred ? toCommentUser(cred.user) : null))
    .catch((e: unknown) => {
      throw friendlyError(e);
    })
    .finally(clearRedirectFlag);
  // 호출하는 쪽이 기다리지 않아도 처리되지 않은 거부로 남지 않게 합니다.
  redirect.catch(() => undefined);

  return {
    redirectResult: () => redirect,

    currentUser: () => (auth.currentUser ? toCommentUser(auth.currentUser) : null),

    onUserChange: (callback) => onAuthStateChanged(auth, (user) => callback(user ? toCommentUser(user) : null)),

    async signIn(provider) {
      const authProvider = provider === 'github' ? new GithubAuthProvider() : new GoogleAuthProvider();
      if (authProvider instanceof GoogleAuthProvider) authProvider.setCustomParameters({ prompt: 'select_account' });

      try {
        const cred = await signInWithPopup(auth, authProvider);
        return toCommentUser(cred.user);
      } catch (e) {
        const code = codeOf(e);
        // 사용자가 창을 닫았거나 다른 팝업 요청으로 대체된 경우: 조용히 끝냅니다.
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null;
        if (code === 'auth/popup-blocked') {
          setRedirectFlag();
          try {
            return await signInWithRedirect(auth, authProvider);
          } catch (redirectError) {
            clearRedirectFlag();
            throw friendlyError(redirectError);
          }
        }
        throw friendlyError(e);
      }
    },

    signOut: () => friendly(() => firebaseSignOut(auth)),

    loadComments: (postKey) =>
      friendly(async () => {
        const snap = await getDocs(query(commentsOf(postKey), orderBy('createdAt', 'asc'), limit(LOAD_LIMIT)));
        return snap.docs.map((d) => toCommentItem(d.id, d.data()));
      }),

    createComment: (postKey, body, parentId = null) =>
      friendly(async () => {
        const text = cleanBody(body);
        const user = requireUser();
        const data = {
          parentId,
          uid: user.uid,
          authorName: authorNameOf(user),
          authorPhoto: authorPhotoOf(user),
          provider: resolveProvider(user),
          isOwner: isUserAdmin(user),
          body: text,
          deleted: false,
        };
        const ref = await addDoc(commentsOf(postKey), { ...data, createdAt: serverTimestamp(), updatedAt: null });
        // Lite SDK는 실시간 구독이 없으므로 화면에는 로컬 값으로 바로 반영합니다.
        return { id: ref.id, ...data, createdAt: Date.now(), updatedAt: null };
      }),

    editComment: (postKey, commentId, body) =>
      friendly(async () => {
        const text = cleanBody(body);
        requireUser();
        await updateDoc(commentRef(postKey, commentId), { body: text, updatedAt: serverTimestamp() });
        return { body: text, updatedAt: Date.now() };
      }),

    deleteComment: (postKey, commentId, opts) =>
      friendly(async () => {
        requireUser();
        const ref = commentRef(postKey, commentId);
        let mode: DeleteResult['mode'];
        if (opts.hasReplies) {
          await updateDoc(ref, {
            deleted: true,
            body: '',
            authorName: '',
            authorPhoto: '',
            updatedAt: serverTimestamp(),
          });
          mode = 'soft';
        } else {
          await deleteDoc(ref);
          mode = 'hard';
        }

        let parentRemoved = false;
        if (opts.cleanupParentId) {
          try {
            await deleteDoc(commentRef(postKey, opts.cleanupParentId));
            parentRemoved = true;
          } catch {
            // 남의 삭제된 댓글 아래 내 답글을 지운 경우 등: 권한이 없으면 자리 표시를 그대로 둡니다.
          }
        }
        return { mode, parentRemoved };
      }),
  };
}
