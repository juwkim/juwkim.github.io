---
title: "[데이터 분석 유형별 실습 문제 04] 비정형 텍스트 분류"
date: 2026-10-09T19:08:03+09:00
category: "Computer Science"
subcategory: "데이터 분석"
tags: []
description: "표현이 조금씩 다른 접수 문장을 분류하면서, 같은 양식의 문장이 Train과 Test에 섞이는 문제를 어떻게 막을까요? 입력의 관측 단위·처리 규칙·결과 파일을 먼저 확인하고 직접 구현합니다. 풀이와 실행 결과는…"
tistoryId: 70
---
> **이번 글의 질문**
>
> 표현이 조금씩 다른 접수 문장을 분류하면서, 같은 양식의 문장이 Train과 Test에 섞이는 문제를 어떻게 막을까요?

> **핵심 요약**
>
> 입력의 관측 단위·처리 규칙·결과 파일을 먼저 확인하고 직접 구현합니다. 풀이와 실행 결과는 연결된 풀이편에서 확인합니다.

## 1. 어떤 문제를 풀까요?

정비·보급·네트워크 요청을 분류하는 접수 기록입니다. 핵심 요청과 다른 분야의 상황 설명이 한 문장에 함께 들어 있습니다. 같은 양식의 반복 문장과 완전히 같은 재접수 문장도 포함했습니다. 실제 접수 기록 대신 분류와 검증 방식을 연습하도록 작성한 문장 데이터입니다.

예선 가이드의 범위로 구성한 연습문제입니다. 실제 예선 문제 원문이나 공식 채점 기준이 아닙니다. 이 유형의 연습용 배점은 100점입니다.

## 2. 입력 데이터와 관측 단위

| 입력 파일 | 구성 | 열·내용 |
| --- | --- | --- |
| reports.jsonl | 369개 객체 | `report_id`, `template_group`, `text`, `label`, `team`, `split` |

### 입력의 처음 세 행을 살펴봅니다

| report\_id | template\_group | text | label | team |
| --- | --- | --- | --- | --- |
| m00\_00 | maintenance\_00 | 접수 1번. 냉각 팬에서 큰 소음이 들립니다. 물품 배송에는 문제가 없습니다. 확인 위치: 구역 1. | maintenance | 팀1 |
| m00\_01 | maintenance\_00 | 접수 2번. 냉각 팬에서 큰 소음이 들립니다. 장비 수리는 완료했습니다. 확인 위치: 구역 2. | maintenance | 팀2 |
| m00\_02 | maintenance\_00 | 접수 3번. 냉각 팬에서 큰 소음이 들립니다. 망 접속 문제는 발생하지 않았습니다. 확인 위치: 구역 3. | maintenance | 팀3 |

입력 일부를 보여 준 표입니다. 전체 분포·중복·결측 상태는 첨부한 데이터를 직접 읽어 확인합니다.

## 3. 구현할 요구사항

-   `None`·빈 `text`는 empty\_text로 남기고 학습·평가에서 제외합니다. 부정 표현과 소수점·날짜를 무조건 지우지 않습니다.
-   제공된 `split`을 사용합니다. `template_group`과 동일한 원문이 Train/Test 양쪽에 있는지 검사합니다.
-   TF-IDF의 vocabulary와 idf도 Fold의 Training 부분에서 학습합니다. `template_group`·`team`·`label`은 텍스트 Feature에 붙이지 않습니다.
-   Train 그룹 CV로 C를 정하고 Test macro F1, 클래스별 Precision·Recall·F1, Baseline을 계산합니다.
-   text\_predictions.csv·text\_errors.csv·text\_metrics.csv·empty\_reports.csv를 저장합니다.

## 4. 제출 파일의 구조

CSV는 results 폴더, 그래프는 plots 폴더에 저장합니다. ID와 상태 열을 유지해 입력과 결과가 다시 연결되도록 합니다. 아래 열 목록은 풀이 결과의 파일 계약입니다.

| 결과 파일 | 행의 기준 | 전체 열 |
| --- | --- | --- |
| `empty_reports.csv` | 요구사항의 관측 단위를 유지합니다. | `report_id`, `template_group`, `text`, `label`, `team`, `split`, `clean_text`, `status` |
| `text_errors.csv` | 요구사항의 관측 단위를 유지합니다. | `report_id`, `template_group`, `text`, `label`, `prediction`, `max_probability`, `status` |
| `text_metrics.csv` | 요구사항의 관측 단위를 유지합니다. | `model`, `macro_f1` |
| `text_predictions.csv` | 요구사항의 관측 단위를 유지합니다. | `report_id`, `template_group`, `text`, `label`, `prediction`, `max_probability`, `status` |

## 5. 연습용 채점 기준

| 평가할 내용 | 배점 |
| --- | --- |
| 텍스트·결측 처리 | 20 |
| 중복·그룹 분할 | 25 |
| Train-only TF-IDF·CV | 30 |
| 평가·오류 분석·출력 | 25 |

## 6. 실습 준비와 점검

참고자료의 문제 자료와 공통 자료를 준비한 뒤, 데이터 폴더 구성을 확인합니다.

```python
from pathlib import Path

root = Path.cwd()
assert (root / "data").is_dir()
print("입력 폴더:", root / "data")
```

### 풀이를 열기 전에 남길 메모

-   한 행이 무엇을 나타내는지 적습니다.
-   기준표·시간·ID·Target 중 어떤 조건이 결과를 바꿀지 적습니다.
-   필수 결과 파일을 먼저 만들고, 추가 실험은 기본 결과를 저장한 뒤 진행합니다.

## 참고자료

### 실습 데이터와 노트북

-   **문제 자료**: [문제 자료](https://drive.google.com/file/d/1ZJ0Or7ZgaxOOODqDFb7KpUClHd9yQJTM/view?usp=drivesdk "Google Drive에서 자료를 엽니다.") — 입력 데이터와 starter.ipynb로 직접 구현을 시작합니다.
-   **공통 자료**: [실습 공통 자료](https://drive.google.com/file/d/1-W9cVOlqQ4BUYRX3AGH3qbC9CsUQjf-g/view?usp=drivesdk "Google Drive에서 자료를 엽니다.") — 공유 모델과 유형별 실습에 필요한 공통 준비 자료입니다.
-   **예선 가이드**: [국방AI경진대회 예선가이드](https://drive.google.com/file/d/1YDxg9ngucdJR7y4zUaBuW5bEYhzh1EJl/view) — 제공된 가이드의 범위를 바탕으로 만든 연습문제입니다.
-   **실행 안내**: — 두 압축파일을 같은 작업 폴더에 풀면 예선\_유형별\_실습 아래에 유형 폴더와 공유 \_models 폴더가 놓입니다. 해당 유형 폴더의 starter.ipynb에서 시작합니다. 공통 준비는 최초 한 번만 압축을 풀면 됩니다.
-   **데이터 출처**: — 한국어 요청 문장은 이 실습을 위해 작성한 양식과 변형입니다. 실제 접수 기록에서 추출한 데이터가 아닙니다.

### 연습문제

-   **풀이**: [유형 04 풀이](/cs/data-analysis/practice-04-text-classification-solution/) — 문장 양식별로 데이터를 나누고 TF-IDF와 Logistic Regression을 Pipeline으로 연결해 그룹 CV로 검증합니다.

### 관련 공부노트

-   **공부노트 07**: [지도 학습 및 평가](/cs/data-analysis/pandas-07-supervised-learning/)
-   **공부노트 10**: [이미지·영상 데이터 분석](/cs/data-analysis/pandas-10-image-video-analysis/)
-   **공부노트 13**: [데이터 분석의 흔한 착각과 실수](/cs/data-analysis/pandas-13-common-pitfalls/)

### 공식 문서

-   **사용한 도구**: [TfidfVectorizer](https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html) — char n-gram·vocabulary·idf의 학습 범위를 확인합니다.  
    [StratifiedGroupKFold](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.StratifiedGroupKFold.html) — 그룹을 유지하며 클래스 비율을 고려합니다.
