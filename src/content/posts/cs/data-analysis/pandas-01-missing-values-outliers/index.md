---
title: "[파이썬 데이터 분석 공부노트 01] 결측치와 이상치 처리"
date: 2026-10-05T14:32:26+09:00
category: "Computer Science"
subcategory: "데이터 분석"
tags: []
description: "결측치를 평균과 중앙값으로 채우고, Z-score와 IQR로 이상치 후보를 찾고, 센서 로그를 병합하는 과정을 정리합니다. 전처리 기준을 훈련 데이터에서만 학습하는 데이터 누수 방지와 Pipeline도 다룹니다."
tistoryId: 49
---
> **이번 글의 질문**
>
> 비어 있는 값은 무엇으로 채우면 좋을까요? 유난히 큰 값은 지워도 될까요? 서로 다른 파일의 기록은 어떤 기준으로 합쳐야 할까요?

> **핵심 요약**
>
> 결측치와 이상치를 처리할 때는 값의 의미를, 데이터를 병합할 때는 시간과 대상의 일치를 확인합니다. 예측 모델에서는 전처리 기준도 훈련 데이터에서만 학습합니다.

## 1. 이번에 공부한 것: 데이터 전처리

빈칸 하나를 채우는 일도 기준이 필요합니다. 0을 넣으면 충분한지, 평균과 중앙값 중 무엇이 어울리는지, 드문 값은 오류인지부터 살펴봅니다. 이번에는 정비 기록과 센서 로그를 정리하면서 값이 바뀐 이유까지 따라가 봅니다.

먼저 다음 세 가지 실습으로 전처리의 기본을 익힙니다. 이어서 같은 코드를 예측 모델에 사용할 때 필요한 데이터 누수 방지와 Pipeline까지 살펴봅니다.

| 실습 | 해결할 문제 | 핵심 문법 |
| --- | --- | --- |
| 장비 정비 기록 | 비어 있는 숫자를 평균·중앙값으로 채우기 | `isna()`, `fillna()`, `mean()`, `median()` |
| 건강검진 기록 | 분포에서 멀리 떨어진 관측 찾기 | `zscore()`, `abs()`, 조건식 필터링 |
| 센서 기록 | 파일 병합, 오류 문자열 변환, 남은 결측치 제거 | `merge()`, `to_numeric()`, `dropna()` |

분석 결과를 해석하기 전에 입력 데이터가 무엇을 의미하는지 확인해야 합니다. 값이 비었다는 이유만으로 0을 넣거나, 값이 크다는 이유만으로 삭제하면 분석 대상 자체를 바꿀 수 있습니다.

## 2. 데이터 구조부터 확인하기

```python
import pandas as pd
import numpy as np
import scipy

print(pd.__version__, np.__version__, scipy.__version__)

df = pd.read_csv("maintenance_log.csv")

print(df.head())
df.info()
print(df.describe())
print(df.isna().sum())
```

| 확인 문법 | 무엇을 확인하나요? |
| --- | --- |
| `head()` | 기본적으로 앞의 5행을 보고 데이터 모양을 파악합니다. |
| `info()` | 열별 자료형과 결측치가 아닌 값의 개수를 확인합니다. |
| `describe()` | 숫자형 열의 개수·평균·표준편차·사분위수 등을 확인합니다. |
| `isna().sum()` | 열별 결측치 개수를 확인합니다. |

`describe()`는 숫자형 열이 있는 경우 기본적으로 숫자형 열을 요약합니다. 전체 열의 요약이 필요하면 `df.describe(include="all")`을 사용할 수 있습니다. 숫자로 보이는 열이 문자열로 읽혔는지도 `info()`로 확인해 봅니다.

### 2-1. DataFrame과 Series

DataFrame은 행과 열로 구성된 2차원 구조이고, Series는 인덱스가 있는 1차원 구조입니다.

```python
df["repair_count"]       # Series
df[["repair_count"]]     # 열이 하나인 DataFrame
```

대괄호 안에 열 이름 하나를 넣는지, 열 이름의 리스트를 넣는지에 따라 결과의 차원이 달라집니다.

## 3. 실습 1: 장비 정비 기록의 결측치 처리

### 3-1. 어떤 값을 채우나요?

이번 실습의 처리 조건은 다음과 같습니다.

- `repair_count`: 해당 열의 평균으로 대체
- `repair_duration`: 해당 열의 평균으로 대체
- `last_check_day`: 해당 열의 중앙값으로 대체

`maintenance_log.csv`는 100행이며, 처리 전 결측치 개수는 다음과 같습니다.

| 열 | 결측치 수 | 대체 값 |
| --- | --: | --: |
| `repair_count` | 14 | 평균 약 3.197674 |
| `repair_duration` | 14 | 평균 약 1.901163 |
| `last_check_day` | 8 | 중앙값 16.5 |

표의 소수는 보기 쉽게 반올림했으며, 코드에서는 계산된 값을 그대로 사용합니다.

### 3-2. 결측치 채우기

```python
df = pd.read_csv("maintenance_log.csv")
before = df.isna().sum()

df["repair_count"] = df["repair_count"].fillna(
    df["repair_count"].mean()
)
df["repair_duration"] = df["repair_duration"].fillna(
    df["repair_duration"].mean()
)
df["last_check_day"] = df["last_check_day"].fillna(
    df["last_check_day"].median()
)

print(pd.DataFrame({
    "처리 전": before,
    "처리 후": df.isna().sum()
}))

df.to_csv("maintenance_cleaned.csv", index=False)
```

처리 후에는 세 열의 결측치가 모두 0개로 줄어듭니다.

`fillna()`는 결측치에만 값을 넣고 기존 값은 유지합니다. `mean()`과 `median()`은 기본적으로 결측치를 제외하고 계산합니다. `index=False`는 CSV에 DataFrame의 인덱스를 별도 열로 저장하지 않도록 지정합니다.

### 3-3. 평균과 중앙값의 선택

평균과 중앙값의 차이는 작은 예제로 확인할 수 있습니다.

```python
s = pd.Series([1, 2, 3, 100, np.nan])

print("평균:", s.mean())
print("중앙값:", s.median())
```

```text
평균: 26.5
중앙값: 2.5
```

100이라는 큰 값 때문에 평균은 26.5까지 올라갑니다. 중앙값은 정렬된 값의 가운데 두 수인 2와 3의 평균이므로 2.5가 됩니다.

| 방법 | 장점 | 주의점 |
| --- | --- | --- |
| 평균 대치 | 간단하고 수치형 열에 적용하기 쉽습니다. | 극단값의 영향을 받으며 같은 값을 반복해서 넣으면 분포가 달라집니다. |
| 중앙값 대치 | 극단값의 영향을 평균보다 덜 받습니다. | 집단별 차이나 다른 변수와의 관계를 반영하지 못합니다. |
| 행 삭제 | 값을 추정해 넣지 않습니다. | 표본이 줄고 특정 집단이 더 많이 제외될 수 있습니다. |
| 의미 있는 상수 대치 | 누락의 의미가 명확할 때 적용하기 쉽습니다. | ‘모름’과 ‘실제로 0’을 혼동하면 안 됩니다. |

평균과 중앙값 중 무엇을 사용할지는 누락 원인과 데이터 분포를 보고 결정합니다. 예를 들어 정비 횟수에 평균을 넣으면 소수가 생길 수 있습니다. 그 값은 실제 관측 횟수가 아니라 대체한 값이므로, 필요하면 대체 여부를 별도 열로 남깁니다.

```python
raw = pd.read_csv("maintenance_log.csv")
raw["repair_count_was_missing"] = raw["repair_count"].isna()

# 평균을 계산할 관측값이 하나도 없는 열도 먼저 확인한다.
print(raw[["repair_count", "repair_duration"]].notna().sum())
```

열 전체가 결측치면 평균이나 중앙값을 계산해도 채울 값이 생기지 않습니다. 처리 후 결측치 개수를 다시 확인하는 이유입니다.

## 4. 실습 2: Z-score로 이상치 후보 찾기

### 4-1. Z-score는 무엇인가요?

Z-score는 값이 평균에서 표준편차 몇 배만큼 떨어져 있는지를 나타냅니다.

`z = (값 - 평균) / 표준편차`

양수는 평균보다 큰 값, 음수는 평균보다 작은 값입니다. 이번 실습에서는 `abs(z) > 3`인 값을 이상치로 판단하므로 양쪽 꼬리를 모두 확인합니다.

**표준화는 데이터를 정규분포로 바꾸는 작업이 아닙니다.** 표준편차가 0이 아닌 데이터의 중심과 크기를 조정하며, 원래 분포가 비대칭이라면 그 비대칭은 남습니다. 따라서 ‘3표준편차’ 기준을 모든 데이터에 통하는 판정 규칙으로 받아들이면 안 됩니다.

### 4-2. Z-score 계산과 조건식 필터링

```python
from scipy.stats import zscore

health = pd.read_csv("health_check.csv")

health[["bmi_z", "bp_z"]] = health[
    ["bmi", "blood_pressure"]
].apply(zscore)

condition = (
    (health["bmi_z"].abs() <= 3)
    & (health["bp_z"].abs() <= 3)
)

# 보존되는 행과 제외되는 행을 나누어 확인한다.
outlier_candidates = health.loc[~condition]
cleaned_health = health.loc[condition].drop(
    columns=["bmi_z", "bp_z"]
)

print("제거된 이상치 행 수:", len(health) - len(cleaned_health))
print(outlier_candidates["soldier_id"].tolist())

cleaned_health.to_csv("health_clean.csv", index=False)
```

```text
제거된 이상치 행 수: 5
['S014', 'S015', 'S080', 'S082', 'S087']
```

`apply(zscore)`는 기본적으로 각 열에 함수를 적용합니다. `&`는 두 조건을 모두 만족하는 행을 고르므로, BMI와 혈압 중 하나라도 기준을 벗어나면 제외됩니다. Series 조건을 결합할 때는 `and` 대신 `&`를 쓰고 각각 괄호로 감쌉니다.

`drop(columns=...)`은 계산을 위해 만든 보조 열을 제거합니다. `dropna()`처럼 결측 여부를 보고 행을 제거하는 함수와 구별해야 합니다.

### 4-3. 직접 계산과 SciPy의 기본값 차이

Z-score는 함수 호출뿐 아니라 평균과 표준편차를 이용해 직접 계산할 수도 있습니다.

```python
z_manual = (
    health["bmi"] - health["bmi"].mean()
) / health["bmi"].std(ddof=0)

z_scipy = zscore(health["bmi"], ddof=0)

print(np.allclose(z_manual, z_scipy))
```

```text
True
```

주의할 부분은 표준편차의 기본값입니다.

| 도구 | 기본 ddof | 표준편차 계산 시 분모 |
| --- | --: | --- |
| pandas `Series.std()` | 1 | N − 1 |
| NumPy `np.std()` | 0 | N |
| SciPy `zscore()` | 0 | N |

결측치가 없는 같은 데이터라도 기본 설정으로 계산하면 값이 조금 달라질 수 있습니다. 직접 계산과 SciPy 결과를 맞추려면 `ddof`를 통일합니다.

또한 `zscore()`의 기본 `nan_policy="propagate"`에서는 결측치가 결과에 전파됩니다. 결측치를 계산에서 제외하려면 `nan_policy="omit"`을 지정할 수 있지만, 결측 위치의 결과는 여전히 결측입니다. 위 필터는 그런 행도 제외할 수 있으므로, 다른 데이터에 적용할 때는 결측치 행과 이상치 행을 따로 집계해야 합니다. 표준편차가 0인 상수 열 역시 별도로 처리합니다.

### 4-4. 비교 실험: IQR 기준

Z-score와 비교할 방법으로 사분위 범위(IQR)를 이용할 수 있습니다.

- IQR = Q3 − Q1
- 하한 = Q1 − 1.5 × IQR
- 상한 = Q3 + 1.5 × IQR

```python
q1, q3 = health["bmi"].quantile([0.25, 0.75])
iqr = q3 - q1

bmi_iqr_outlier = (
    (health["bmi"] < q1 - 1.5 * iqr)
    | (health["bmi"] > q3 + 1.5 * iqr)
)

print("BMI의 IQR 이상치 후보 수:", bmi_iqr_outlier.sum())
```

```text
BMI의 IQR 이상치 후보 수: 4
```

이번에는 **BMI 한 열에서 4행**이 이상치 후보로 잡혔습니다. 앞의 Z-score 예제는 BMI와 혈압을 함께 검사한 결과이므로, 두 방법을 비교하려면 검사할 열부터 같게 맞춰야 합니다.

Z-score는 평균·표준편차를 사용해 해석이 직관적이지만 극단값의 영향을 받습니다. IQR은 사분위수를 사용해 극단값의 영향을 상대적으로 덜 받지만, 비대칭 분포에서 정상적인 큰 값도 후보로 잡힐 수 있습니다. 어느 방법이든 통계적 후보를 찾는 기준입니다. 기록 오류인지, 드물지만 실제인 관측인지 확인하는 판단이 뒤따라야 합니다.

## 5. 실습 3: 센서 로그 병합과 오류 처리

### 5-1. 시간 기준으로 병합하기

```python
motion = pd.read_csv("motion_sensor.csv")
temp = pd.read_csv("temp_sensor.csv")

merged = pd.merge(
    motion,
    temp,
    on="time",
    suffixes=("_motion", "_temp")
)

print("병합 행 수:", len(merged))
```

```text
병합 행 수: 100
```

`on="time"`은 시간이 같은 행을 연결합니다. `how`의 기본값은 `"inner"`이므로 양쪽에 존재하는 키만 남깁니다. 양쪽에 `post_id`라는 열이 있지만 병합 키로 사용하지 않았으므로, 접미사를 붙인 `post_id_motion`, `post_id_temp`로 구별됩니다.

데이터베이스의 JOIN을 배웠다면 `merge()`도 키를 기준으로 테이블을 연결하는 연산으로 이해할 수 있습니다. 다만 pandas에서는 양쪽의 결측 키끼리도 매칭될 수 있어 일반적인 SQL의 NULL 처리와 다릅니다.

### 5-2. 오류 문자열을 숫자형 결측치로 바꾸기

```python
merged["motion_count"] = pd.to_numeric(
    merged["motion_count"],
    errors="coerce"
)

print("변환 후 결측치 수:", merged["motion_count"].isna().sum())

motion_mean = merged["motion_count"].mean()
merged["motion_count"] = merged["motion_count"].fillna(motion_mean)

cleaned_sensor = merged.dropna()

print("최종 행 수:", len(cleaned_sensor))
cleaned_sensor.to_csv("merged_sensor_cleaned.csv", index=False)
```

```text
변환 후 결측치 수: 15
최종 행 수: 91
```

원본 `motion_count`에는 빈 값 12개와 `"error"` 3개가 있습니다. 변환 후 15개의 결측치를 평균 약 4.823529로 채우고, 남은 온도 결측치 9행을 제거하면 91행이 됩니다.

`pd.to_numeric(..., errors="coerce")`는 숫자로 해석할 수 없는 값을 결측치로 바꿉니다. `"error"`만 처리하는 전용 옵션은 아니므로 다른 잘못된 문자열도 함께 변환됩니다.

이때 0은 정상적인 관측값입니다. ‘움직임이 0회’와 ‘측정값을 알 수 없음’을 구별해야 합니다.

### 5-3. dropna의 삭제 범위 지정하기

기본 `dropna()`는 어느 열이든 결측치가 하나 있으면 그 행을 제거합니다. 분석에 필요한 열만 검사하려면 다음처럼 지정합니다.

```python
required = ["time", "motion_count", "temperature"]
cleaned_required = merged.dropna(subset=required)
```

`subset`에 넣은 열은 유지해야 할 필수 정보라는 의미입니다. 관련 없는 메모 열의 결측치 때문에 관측이 삭제되는 상황을 줄일 수 있습니다.

## 6. 비교 실험: 시간과 초소 ID를 함께 확인하기

센서 CSV에서 양쪽 초소 ID를 비교하면 다음과 같습니다.

```python
mismatch = merged["post_id_motion"] != merged["post_id_temp"]
print("초소 ID가 다른 행 수:", mismatch.sum())
```

```text
초소 ID가 다른 행 수: 66
```

**시간만으로 병합하면 서로 다른 초소의 기록이 섞일 수 있습니다.** 예를 들어 P01 초소의 09:00 움직임 기록에 P03 초소의 09:00 온도가 붙을 수 있습니다.

한 초소의 움직임과 온도를 함께 분석하려면 시간뿐 아니라 초소 ID도 같아야 합니다. 이 경우 `time`과 `post_id`를 함께 병합 키로 사용합니다.

```python
same_post = pd.merge(
    motion,
    temp,
    on=["time", "post_id"],
    how="inner",
    validate="one_to_one"
)

same_post["motion_count"] = pd.to_numeric(
    same_post["motion_count"], errors="coerce"
)
same_post["motion_count"] = same_post["motion_count"].fillna(
    same_post["motion_count"].mean()
)

print("시간·초소 기준 병합 행 수:", len(same_post))
print("남은 결측치 제거 후:", len(same_post.dropna()))
```

```text
시간·초소 기준 병합 행 수: 34
남은 결측치 제거 후: 32
```

| 병합 기준 | 병합 직후 | 결측치 처리 후 | 연결 의미 |
| --- | --: | --: | --- |
| 시간 | 100행 | 91행 | 같은 시간의 기록 |
| 시간 + 초소 ID | 34행 | 32행 | 같은 시간·같은 초소의 기록 |

시간과 초소 ID를 함께 사용하면 서로 다른 초소끼리 연결됐던 66행이 빠지고, 같은 초소의 기록 34행이 남습니다. 여기서 결측치가 남은 2행을 제거하면 최종 결과는 32행입니다.

`validate="one_to_one"`은 양쪽 키가 각각 유일한지 검사합니다. 중복 키 때문에 의도치 않은 조합이 생기는 상황을 확인할 수 있습니다. 일대다 관계가 맞는 데이터라면 그에 맞는 검증 조건을 써야 합니다.

필요하면 `how="outer", indicator=True`로 병합해 `_merge` 열의 `left_only`, `right_only`, `both`를 확인합니다.

## 7. 최신 사용법: 결측치를 채운 결과는 명시적으로 대입하기

결측치를 채운 결과는 아래처럼 해당 열에 다시 대입하면 됩니다.

```python
df["repair_count"] = df["repair_count"].fillna(
    df["repair_count"].mean()
)
```

다음처럼 선택한 열에 `inplace=True`를 사용하는 방식은 주의해야 합니다.

```text
df["repair_count"].fillna(value, inplace=True)
```

pandas 3.0에서는 Copy-on-Write가 기본이자 유일한 동작 모드입니다. 선택한 Series를 `inplace=True`로 수정해도 원본 DataFrame에 변경이 전달되지 않습니다. 결과를 해당 열에 명시적으로 대입하면 수정 대상이 분명해집니다.

여러 열에 서로 다른 값을 채울 때는 Dictionary도 사용할 수 있습니다.

```python
df = pd.read_csv("maintenance_log.csv")
fill_values = {
    "repair_count": df["repair_count"].mean(),
    "repair_duration": df["repair_duration"].mean(),
    "last_check_day": df["last_check_day"].median(),
}
df = df.fillna(fill_values)
```

열별 대입은 처리 과정을 하나씩 살펴보기 편합니다. 여러 열의 처리 규칙을 한곳에 모으고 싶다면 Dictionary 방식이 깔끔합니다.

## 8. 데이터 누수: 평균을 구하는 것도 학습입니다

지금까지는 결측치를 채우고, 이상치 후보를 찾고, 센서 기록을 합쳤습니다. 이 데이터를 예측 모델에 사용한다면 한 가지를 더 확인해야 합니다.

**결측치를 채울 평균은 어느 데이터에서 계산해야 할까요?**

### 8-1. 데이터 누수는 무엇인가요?

데이터 누수(Data Leakage)는 예측 시점에 알 수 없는 정보가 모델을 만드는 과정에 들어가는 문제입니다. 평가 점수는 높아도 새로운 데이터에서는 기대한 성능이 나오지 않을 수 있습니다.

이 문제는 모델 학습뿐 아니라 전처리에서도 발생합니다. 결측치를 채울 평균, Scaling에 사용할 표준편차, 사용할 Feature를 고르는 기준도 데이터에서 얻는 정보이기 때문입니다.

> **먼저 데이터를 나누고, 전처리 기준은 훈련 데이터에서 학습합니다. 검증·테스트 데이터에는 학습한 기준을 그대로 적용합니다.**

### 8-2. 전체 평균으로 채우면 무엇이 달라질까요?

원리를 이해하기 위해 정비 시간 값을 작게 구성해 보겠습니다.

| 구분 | 값 |
| --- | --- |
| 훈련 데이터 | 1, 3, 결측치 |
| 테스트 데이터 | 100, 결측치 |

훈련 데이터만으로 계산한 평균은 **2**입니다. 전체 데이터를 합쳐 계산하면 평균은 **(1 + 3 + 100) / 3 ≈ 34.67**이 됩니다.

훈련 데이터의 결측치를 34.67로 채우면, 테스트에 있는 100이 훈련 데이터의 값을 바꾼 셈입니다. 테스트의 정답을 직접 보지 않아도 이렇게 정보가 섞일 수 있습니다.

이 예제에서는 양쪽의 결측치를 모두 **훈련 평균인 2**로 채웁니다.

```python
from sklearn.impute import SimpleImputer

train_example = pd.DataFrame({
    "repair_duration": [1.0, 3.0, np.nan]
})
test_example = pd.DataFrame({
    "repair_duration": [100.0, np.nan]
})

imputer = SimpleImputer(strategy="mean")

train_filled = imputer.fit_transform(train_example)
test_filled = imputer.transform(test_example)

print("학습한 평균:", imputer.statistics_)
print("훈련 데이터:", train_filled.ravel())
print("테스트 데이터:", test_filled.ravel())
```

```text
학습한 평균: [2.]
훈련 데이터: [1. 3. 2.]
테스트 데이터: [100.   2.]
```

SimpleImputer는 대체할 값을 계산해 저장하고, 이후 데이터에도 같은 값을 적용할 수 있게 해 줍니다. `statistics_`를 확인하면 각 열에 사용할 대체 값을 볼 수 있습니다.

### 8-3. fit, transform, fit_transform 구분하기

전처리 객체에서 세 메서드는 다음 역할을 합니다.

| 메서드 | 역할 | 평균 대치의 예 |
| --- | --- | --- |
| `fit(X)` | 처리 기준을 계산하고 저장합니다. | 평균 2를 저장합니다. |
| `transform(X)` | 저장한 기준을 적용합니다. | 결측치를 2로 채웁니다. |
| `fit_transform(X)` | 기준을 계산한 뒤 적용합니다. | 평균 2를 구하고 결측치를 채웁니다. |

훈련 데이터에는 `fit_transform()`, 검증·테스트 데이터에는 `transform()`을 사용합니다.

테스트 데이터에도 `fit_transform()`을 호출하면 테스트 기준으로 대체 값을 다시 계산합니다. 위 예제에서는 테스트 결측치가 100으로 채워지고, 객체에 저장된 평균도 100으로 바뀝니다.

`fillna()`는 DataFrame의 값을 직접 채울 때 간단합니다. SimpleImputer는 대체 기준을 저장해 새 데이터에도 반복 적용하기 편합니다.

### 8-4. Scaling도 같은 기준을 적용합니다

StandardScaler는 평균을 빼고 표준편차로 나눕니다.

`z = (값 - 훈련 평균) / 훈련 표준편차`

훈련 평균이 10, 표준편차가 2라면 테스트의 값 14는 `(14 - 10) / 2 = 2`로 변환합니다. 훈련 데이터의 평균에서 표준편차 두 배만큼 떨어져 있다는 의미입니다.

테스트 데이터의 평균을 다시 계산해 사용하면 훈련과 예측의 기준이 달라집니다. StandardScaler도 훈련 통계량을 저장하고 이후 변환에 재사용합니다.

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()

train_scaled = scaler.fit_transform(train_filled)
test_scaled = scaler.transform(test_filled)

print("훈련 데이터:", train_scaled.ravel())
print("테스트 데이터:", np.round(test_scaled.ravel(), 2))
```

```text
훈련 데이터: [-1.22474487  1.22474487  0.        ]
테스트 데이터: [120.02   0.  ]
```

테스트의 100이 큰 값으로 남는 것은 훈련 데이터의 1\~3 범위에서 멀리 떨어져 있기 때문입니다. 테스트에서도 같은 기준을 사용한 결과입니다.

## 9. Pipeline: 전처리부터 예측까지 연결하기

결측치 처리, Scaling, 모델 학습을 각각 관리하면 중간 단계를 빠뜨리기 쉽습니다. Pipeline으로 묶으면 같은 순서의 처리를 학습과 예측에 적용할 수 있습니다.

### 9-1. 예제 데이터와 Pipeline 구성

흐름을 살펴보기 위해 회귀용 예제 데이터를 생성합니다. `X`는 입력 Feature, `y`는 예측할 Target입니다.

```python
from sklearn.datasets import make_regression
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

X, y = make_regression(
    n_samples=200,
    n_features=3,
    noise=10,
    random_state=42
)

# 일부 값을 비워 결측치 처리가 필요한 상황을 만듭니다.
rng = np.random.default_rng(42)
X[rng.random(X.shape) < 0.1] = np.nan

# 전처리 기준을 학습하기 전에 데이터를 나눕니다.
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

model = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
    ("regressor", Ridge(alpha=1.0))
])
```

이 Pipeline은 **중앙값 대치 → StandardScaler → Ridge 회귀** 순서로 처리합니다.

### 9-2. fit과 predict에서 일어나는 일

```python
model.fit(X_train, y_train)
```

`fit()`에서는 다음 작업이 이루어집니다.

1. 훈련 데이터의 중앙값을 계산하고 결측치를 채웁니다.
2. 채워진 훈련 데이터에서 평균과 표준편차를 계산하고 Scaling합니다.
3. 변환된 데이터로 Ridge 모델을 학습합니다.

나중에 `model.predict(X_test)`를 호출하면 저장된 중앙값과 Scaling 기준을 적용한 뒤 예측합니다. 테스트 데이터로 전처리 기준을 다시 계산하지 않습니다.

## 10. Cross-validation: Fold 안에서도 전처리를 학습합니다

### 10-1. 먼저 전처리하고 Fold를 나누면 생기는 문제

훈련 데이터 전체에 Scaling을 적용한 다음 Cross-validation을 수행하면, 각 Fold의 검증 데이터가 이미 평균과 표준편차 계산에 참여한 상태가 됩니다.

그래서 **전처리를 포함한 Pipeline 전체를 Cross-validation에 전달**합니다. 각 Fold의 훈련 부분에서만 기준을 계산하고, 검증 부분에는 그 기준을 적용하게 됩니다.

```python
from sklearn.model_selection import KFold, cross_val_score

cv = KFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

scores = cross_val_score(
    model,
    X_train,
    y_train,
    cv=cv,
    scoring="neg_mean_absolute_error"
)

print("Cross-validation MAE:", round(-scores.mean(), 2))
```

Cross-validation은 전달받은 Pipeline을 복제해 Fold마다 새로 학습합니다. 앞에서 `model.fit()`을 실행했더라도 그때 계산한 중앙값이나 Scaling 기준을 각 Fold에 재사용하지 않습니다.

`neg_mean_absolute_error`는 MAE에 음수를 붙인 점수입니다. scikit-learn의 점수는 클수록 좋게 비교하도록 설계돼 있어, 결과에 다시 음수를 붙여 익숙한 MAE로 읽습니다.

### 10-2. 검증 결과로 선택하고 테스트로 최종 평가하기

데이터의 역할을 구분하면 모델을 개선하는 과정도 명확해집니다.

| 데이터 | 역할 |
| --- | --- |
| 훈련 데이터 | 전처리 기준과 모델을 학습합니다. |
| 검증 데이터 또는 CV의 검증 Fold | 전처리 방법, 모델, Hyperparameter를 비교합니다. |
| 테스트 데이터 | 선택을 마친 모델의 성능을 최종 평가합니다. |

예를 들어 평균 대치와 중앙값 대치 중 무엇이 나은지, Ridge의 `alpha`를 어떻게 정할지는 검증 결과로 판단합니다. 테스트 점수를 보면서 설정을 반복해서 바꾸면 테스트도 모델 선택에 사용한 데이터가 됩니다.

설정을 결정한 뒤에는 훈련 데이터 전체로 다시 학습하고 테스트 데이터를 평가합니다. 여기서는 앞에서 정한 설정을 그대로 사용합니다.

```python
from sklearn.metrics import mean_absolute_error

model.fit(X_train, y_train)
predictions = model.predict(X_test)

print("Test MAE:", round(
    mean_absolute_error(y_test, predictions), 2
))
```

MAE는 예측값과 실제값 차이의 절댓값을 평균한 값이며, Target과 같은 단위를 가집니다.

## 11. 전처리에서 놓치기 쉬운 데이터 누수

Pipeline은 전처리의 적용 순서를 관리해 줍니다. 어떤 데이터를 나눌지, 어떤 Feature를 사용할지는 분석 목적에 맞게 정해야 합니다.

### 11-1. 시간 순서가 있는 데이터

과거 기록으로 다음 달 장비 고장을 예측할 때 무작위로 데이터를 나누면, 미래 기록으로 학습하고 과거를 평가하는 상황이 생길 수 있습니다.

이런 문제에서는 시간순으로 정렬한 뒤 과거를 훈련에, 이후 구간을 평가에 사용합니다. TimeSeriesSplit은 시간 순서를 유지하는 Cross-validation에 활용할 수 있습니다. 센서 관측 간격이 불규칙하면 평가 기간의 길이와 간격도 함께 확인합니다.

### 11-2. 같은 장비의 기록이 여러 행에 있는 데이터

A001 장비의 정비 기록이 여러 행에 걸쳐 있다고 가정해 보겠습니다.

**처음 보는 장비에도 잘 예측하는지** 평가하려면 같은 장비가 훈련과 검증 양쪽에 들어가지 않도록 장비 ID를 기준으로 나눕니다. GroupKFold는 같은 Group이 한 Fold의 훈련·검증에 겹치지 않게 분할합니다.

이미 운영 중인 장비의 미래 상태를 예측한다면 그 장비의 과거 기록은 유용한 입력입니다. 이때는 시간 순서를 고려합니다. 분할 기준은 실제로 예측하려는 상황에 맞춰 선택합니다.

### 11-3. 예측 시점 이후에 기록되는 Feature

정비 시작 전에 소요 시간을 예측하면서, 정비가 끝난 뒤 결정되는 최종 수리비를 입력한다고 생각해 보겠습니다. 수리비와 소요 시간이 밀접하게 연결돼 있으면 평가 점수가 높게 나올 수 있습니다.

하지만 정비 시작 시점에는 최종 수리비를 알 수 없습니다. 이런 Feature가 포함돼 있다면 Pipeline을 사용해도 누수가 발생합니다. **각 열이 언제 기록되는 정보인지** 확인해야 합니다.

센서 로그를 병합할 때도 같습니다. 09:00 시점의 상태를 예측하면서 09:05에 수집된 정보를 연결하지 않도록 병합 키와 시간 범위를 확인합니다.

### 11-4. 이상치를 제거할 때도 평가 대상을 생각합니다

Z-score의 평균·표준편차나 IQR의 사분위수처럼 데이터에서 정하는 기준은 모델 평가 시 훈련 부분에서 계산합니다.

또한 테스트 데이터에서 극단값을 제거하면 실제 예측 대상 중 어려운 사례가 평가에서 빠질 수 있습니다. 사전에 정한 입력 오류를 걸러내는 것인지, 드물지만 정상적인 관측을 제외하는 것인지 구분합니다.

| 처리 | 예측 모델로 확장할 때 확인할 점 |
| --- | --- |
| 평균·중앙값 대치 | 훈련 데이터에서 대체 값을 계산했나요? |
| Z-score·IQR | 기준을 정할 때 검증·테스트 데이터를 포함하지 않았나요? |
| 이상치 제거 | 실제 예측 대상에 포함될 사례를 평가에서 빼지 않았나요? |
| 센서 기록 병합 | 예측 시점에 알 수 있는 기록만 연결했나요? |
| 처리 방법 선택 | 테스트 점수가 아니라 검증 결과를 사용했나요? |

한편 날짜 문자열 파싱이나 미리 정한 단위 변환은 다른 행에서 평균·분포를 학습하는 작업과 다릅니다. 어떤 작업이 데이터에서 기준을 학습하는지 구별하면 누수 가능성을 더 쉽게 찾을 수 있습니다.

현재 데이터의 현황을 요약하는 분석과 미래 데이터를 예측하는 모델 평가도 목적이 다릅니다. 이번 결측치 처리 실습에서는 전체 CSV의 평균을 사용했지만, **새로운 데이터에 대한 예측 성능을 평가할 때는 데이터 분할부터 진행합니다.**

## 12. 더 살펴보기: 채운 값 옆에 결측 여부도 남깁니다

중앙값으로 빈칸을 채우면 계산은 가능해집니다. 그런데 원래 관측한 80과 빈칸을 채워 만든 80은 같은 정보일까요? 대체한 값만 저장하면 이 차이가 사라집니다.

`isna()`로 대체 전의 상태를 별도 열에 남깁니다. 어떤 장비에서 기록이 자주 빠지는지 살펴보거나, 결측 여부 자체가 예측에 도움이 되는지 Train 안에서 비교할 수 있습니다.

```python
import pandas as pd

example = pd.DataFrame({"score": [70.0, None, 90.0]})
example["score_missing"] = example["score"].isna().astype("int8")
example["score_filled"] = example["score"].fillna(example["score"].median())
print(example.to_string(index=False))
```

```text
 score  score_missing  score_filled
  70.0              0          70.0
   NaN              1          80.0
  90.0              0          90.0
```

실제 모델에서는 중앙값을 Train에서 정합니다. `SimpleImputer(add_indicator=True)`로 대체와 표시를 함께 처리할 수도 있습니다. 기본 설정의 Indicator는 학습 때 결측값이 있던 열에만 만들어지므로, 새 데이터에서 처음 나타난 결측도 추적해야 한다면 표시 열의 구성을 미리 정합니다.

## 13. 다시 볼 때 기억할 핵심 문법

| 언제 사용하나요? | 문법 | 주의점 |
| --- | --- | --- |
| 열별 결측치 확인 | `df.isna().sum()` | 처리 전후 모두 확인 |
| 평균으로 채우기 | `s.fillna(s.mean())` | 극단값과 전부 결측인 열 확인 |
| 중앙값으로 채우기 | `s.fillna(s.median())` | 집단별 차이는 별도 판단 |
| 잘못된 숫자 문자열 변환 | `pd.to_numeric(s, errors="coerce")` | 변환 실패 내역도 확인 |
| 결측 행 제거 | `df.dropna(subset=[...])` | 필수 열의 범위를 명확히 지정 |
| 양쪽 이상치 후보 판별 | `z.abs() > 3` | 정규분포 변환이나 오류 확정이 아님 |
| 행 단위 조건 결합 | `(조건1) & (조건2)` | `and`와 구별, 괄호 사용 |
| 파일 연결 | `pd.merge(a, b, on=[...])` | 키의 의미와 중복 확인 |
| 보조 열 삭제 | `df.drop(columns=[...])` | 결측치 삭제와 구별 |
| CSV 저장 | `df.to_csv("파일.csv", index=False)` | 인덱스 저장 여부 선택 |
| 전처리 기준 학습·적용 | `fit_transform(X_train)` | 훈련 데이터만 사용 |
| 새 데이터 전처리 | `transform(X_test)` | 저장된 기준 재사용 |
| 전처리·모델 연결 | `Pipeline([...])` | 학습과 예측의 처리 순서 통일 |
| 교차 검증 | `cross_val_score(pipeline, ...)` | 전처리도 Fold 안에서 학습 |

복습할 때는 다음 네 가지를 확인해 보면 좋습니다.

1. **결측치:** 값이 왜 비었으며, 평균·중앙값·삭제 중 어떤 방법이 적절한가요?
2. **이상치:** 유난히 크거나 작은 값이 입력 오류인가요, 실제로 측정된 값인가요?
3. **데이터 병합:** 한 행으로 합친 움직임 기록과 온도 기록은 시간과 초소 ID가 모두 일치하나요?
4. **데이터 누수:** 평균·중앙값·Scaling 기준을 훈련 데이터에서만 계산했나요?

다시 펼쳐볼 때는 대체한 값과 삭제한 행의 이유부터 확인합니다. 원본 값과 처리 상태가 남아 있으면 같은 기준으로 다시 분석할 수 있습니다.

## 참고자료

### 실습 데이터와 노트북

- **실습 자료**: [Session01 실습 폴더](https://github.com/juwkim/juwkim.github.io/tree/master/public/files/maicon-2026/code/session01) · [session01_결측치-및-이상치-처리.pdf](/files/maicon-2026/lectures/session01_%EA%B2%B0%EC%B8%A1%EC%B9%98-%EB%B0%8F-%EC%9D%B4%EC%83%81%EC%B9%98-%EC%B2%98%EB%A6%AC.pdf) · [session01.ipynb](/files/maicon-2026/code/session01/session01.ipynb)
- **CSV 데이터**: [maintenance_log.csv](/files/maicon-2026/code/session01/maintenance_log.csv) · [health_check.csv](/files/maicon-2026/code/session01/health_check.csv) · [motion_sensor.csv](/files/maicon-2026/code/session01/motion_sensor.csv) · [temp_sensor.csv](/files/maicon-2026/code/session01/temp_sensor.csv)
- **심화 예제**: [심화 예제 자료](/files/maicon-2026/practice/%EA%B3%B5%EB%B6%80%EB%85%B8%ED%8A%B8_%EC%8B%AC%ED%99%94_%EC%98%88%EC%A0%9C.zip "Google Drive에서 자료를 엽니다.") — 공부노트 01\~13의 Python 코드, 노트북, 예제 CSV와 실행 결과를 함께 받습니다.

### 연습문제

- **문제**: [유형 01 문제](/cs/data-analysis/practice-01-tabular-preprocessing/) — 중복 거래와 단위가 다른 수량을 정리한 뒤, 팀별·일별 보급량을 어떻게 믿을 수 있게 계산할까요?
- **풀이**: [유형 01 풀이](/cs/data-analysis/practice-01-tabular-preprocessing-solution/) — 최신 거래를 선택하고 수량 단위를 맞춘 뒤, 오류 기록을 분리해 팀별·일별로 집계합니다.

### 공식 문서

- **데이터 확인**: pandas [DataFrame.describe](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.describe.html) — 숫자형 열의 요약 통계를 보고, `include="all"`로 전체 열을 요약할 때
- **결측치**
  - pandas [결측치 처리](https://pandas.pydata.org/docs/user_guide/missing_data.html) — isna, fillna, dropna와 결측치 판별 방식을 정리한 가이드
  - pandas [Series.mean](https://pandas.pydata.org/docs/reference/api/pandas.Series.mean.html) — 결측치를 건너뛰고 평균을 계산하는 기본 동작(skipna)
  - pandas [DataFrame.dropna](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.dropna.html) — how, subset 옵션으로 삭제할 행의 범위를 정할 때
  - pandas [Copy-on-Write](https://pandas.pydata.org/docs/user_guide/copy_on_write.html) — inplace 대신 결과를 열에 다시 대입해야 하는 이유(pandas 3.0)
  - scikit-learn [결측치 대체](https://scikit-learn.org/stable/modules/impute.html) — 평균·중앙값 같은 대체 값을 훈련 데이터에서 계산해 적용하는 방법
  - scikit-learn [SimpleImputer](https://scikit-learn.org/stable/modules/generated/sklearn.impute.SimpleImputer.html) — 대체 값을 fit으로 저장해 두고 새 데이터에 재사용할 때
- **이상치**
  - SciPy [scipy.stats.zscore](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.zscore.html) — ddof와 nan_policy 기본값을 확인할 때
  - pandas [Series.std](https://pandas.pydata.org/docs/reference/api/pandas.Series.std.html) — 표준편차의 기본 ddof는 1(N − 1)
  - NumPy [numpy.std](https://numpy.org/doc/stable/reference/generated/numpy.std.html) — 표준편차의 기본 ddof는 0(N)
- **병합·변환**
  - pandas [merge](https://pandas.pydata.org/docs/reference/api/pandas.merge.html) — on, how, validate, indicator 옵션으로 병합 결과를 점검할 때
  - pandas [to_numeric](https://pandas.pydata.org/docs/reference/api/pandas.to_numeric.html) — `errors="coerce"`로 숫자가 아닌 값을 결측치로 바꾸는 방법
- **누수·평가**
  - scikit-learn [데이터 누수와 전처리 주의점](https://scikit-learn.org/stable/common_pitfalls.html) — 전처리 단계에서 누수가 생기는 대표적인 경우
  - scikit-learn [StandardScaler](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.StandardScaler.html) — 훈련 데이터의 평균·표준편차를 저장해 이후 변환에 재사용
  - scikit-learn [Pipeline](https://scikit-learn.org/stable/modules/compose.html) — 전처리와 모델을 묶어 학습과 예측에 같은 순서로 적용
  - scikit-learn [Cross-validation](https://scikit-learn.org/stable/modules/cross_validation.html) — Fold마다 전처리를 새로 학습하도록 Pipeline째 넘기는 방법
  - scikit-learn [cross_val_score](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.cross_val_score.html) — Pipeline을 넘겨 Fold별 점수를 계산하는 함수
  - scikit-learn [TimeSeriesSplit](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html) — 시간 순서를 유지하며 나누는 교차 검증
  - scikit-learn [GroupKFold](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupKFold.html) — 같은 그룹이 훈련·검증에 겹치지 않게 나누는 교차 검증
  - scikit-learn [Metrics and scoring](https://scikit-learn.org/stable/modules/model_evaluation.html#scoring-string-names) — neg_mean_absolute_error 같은 scoring 이름 정리
  - scikit-learn [mean_absolute_error](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.mean_absolute_error.html) — MAE 계산 방법, 값은 Target과 같은 단위
