---
title: "[파이썬 데이터 분석 공부노트 02] 정규화와 인코딩"
date: 2026-10-05T19:55:40+09:00
category: "Computer Science"
subcategory: "데이터 분석"
tags: []
description: "횟수와 초 단위 기록을 같은 기준으로 비교하려면 어떻게 해야 할까요? 보직에 붙인 숫자가 순위를 뜻해도 될까요? CSV에 적힌 영상 경로는 실제로 사용할 수 있는 파일을 가리킬까요? Scaling은 숫자의 크기…"
tistoryId: 52
---
> **이번 글의 질문**
>
> 횟수와 초 단위 기록을 같은 기준으로 비교하려면 어떻게 해야 할까요? 보직에 붙인 숫자가 순위를 뜻해도 될까요? CSV에 적힌 영상 경로는 실제로 사용할 수 있는 파일을 가리킬까요?

> **핵심 요약**
>
> Scaling은 숫자의 크기 기준을 맞추고, Encoding은 범주의 의미에 맞는 숫자 표현을 만듭니다. 변환 기준은 훈련 데이터에서 학습하며, 파일 경로는 기준 폴더와 실제 파일 여부까지 확인합니다.

## 1. 숫자를 바꾸기 전에, 숫자가 뜻하는 것부터 확인합니다

단위가 다른 숫자와 문자열 범주를 모델에 넣으려면 입력 형식부터 맞춰야 합니다. 팔굽혀펴기 횟수와 달리기 시간의 크기를 조정하고, 보직과 지역을 숫자로 표현합니다. 어떤 변환을 했는지보다 왜 그 변환이 필요한지에 초점을 맞춥니다.

| 실습 파일 | 데이터 | 이번에 해결할 문제 |
| --- | --- | --- |
| `fitness_test.csv` | 100행, 4열 | 팔굽혀펴기·달리기·윗몸일으키기 기록을 MinMax Scaling하고 원본과 함께 저장합니다. |
| `soldier_info.csv` | 100행, 4열 | 보직과 지역을 인코딩하고 숫자가 무엇을 뜻하는지 기록합니다. |
| `video_metadata.csv` | 3행, 3열 | 경로가 존재하는지 확인하고 파일 목록을 나눕니다. |

팔굽혀펴기 68회와 달리기 488초를 그대로 더하면 어떤 값이 더 중요할까요? 숫자만 보면 488이 크게 보이지만, 횟수와 시간은 서로 다른 단위입니다. Scaling은 이런 크기 차이를 조정합니다. 보직을 0, 1, 2로 바꾸는 Encoding에서는 단위보다 **그 숫자가 순서나 거리를 뜻해도 되는지**가 중요합니다.

> **Scaling은 단위를 조정하는 작업이고, Encoding은 범주를 표현하는 작업입니다. 숫자로 바뀌었다는 사실보다 그 숫자의 의미를 먼저 확인합니다.**

## 2. MinMax Scaling과 Standardization은 무엇이 다른가요?

### 2-1. MinMax Scaling: 최소값과 최대값을 기준으로 맞춥니다

기본 `MinMaxScaler()`는 각 열에서 학습한 최소값을 0, 최대값을 1로 대응시킵니다. 최소값과 최대값이 다른 열의 계산식은 다음과 같습니다.

`x_scaled = (x - min) / (max - min)`

윗몸일으키기 기록의 최소값은 25회, 최대값은 68회입니다. 41회는 `(41 - 25) / (68 - 25)`, 약 0.372093으로 바뀝니다. 같은 열 안의 크기 순서는 유지하면서 비교 기준을 바꿉니다. `feature_range=(-1, 1)`처럼 출력 범위도 지정할 수 있습니다.

### 2-2. Standardization: 평균과 표준편차를 기준으로 맞춥니다

`StandardScaler()`의 기본 동작은 각 열에서 평균을 빼고 표준편차로 나누는 것입니다. 상수가 아닌 열의 훈련 데이터를 기준으로 평균은 0, 표준편차는 1에 가깝게 맞춰집니다.

`z = (x - mean) / std`

여기서 꼭 기억할 점이 있습니다. **평균이 0이고 표준편차가 1이라고 해서 정규분포가 되는 것은 아닙니다.** 값이 한쪽에 몰려 있던 분포는 표준화 뒤에도 한쪽에 몰려 있습니다. 모든 Feature의 분포 모양이 같아지거나 서로의 상관관계가 사라지는 것도 아닙니다.

| 방법 | 학습하는 기준 | 주요 특징 |
| --- | --- | --- |
| MinMaxScaler | 열별 최소값·최대값 | 기본 범위는 0\~1입니다. 새로운 값은 이 범위를 벗어날 수 있습니다. |
| StandardScaler | 열별 평균·표준편차 | 평균 중심으로 크기를 맞춥니다. 값의 범위는 제한하지 않습니다. |
| RobustScaler | 열별 중앙값·IQR | 극단적인 값이 기준에 미치는 영향을 줄입니다. 이상치를 삭제하지는 않습니다. |

상수 열은 변동 자체가 없습니다. StandardScaler의 기본 설정에서는 그 열이 0으로 변환되고, MinMaxScaler의 기본 범위에서도 훈련 값은 0이 됩니다. 이런 열은 정보를 제공하는지 별도로 확인합니다.

정규화라는 용어도 문맥에 따라 달라집니다. 이 글에서는 0\~1로 바꾸는 **MinMax Scaling**을 다룹니다. scikit-learn의 `Normalizer`는 각 행의 벡터 길이를 1로 맞추는 별도 기능입니다. 열의 범위를 맞추는 MinMaxScaler와 구별합니다.

## 3. 실습 1: 체력 기록을 0\~1 범위로 변환합니다

### 3-1. 실제 열 이름과 결측치를 확인합니다

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, StandardScaler

fitness = pd.read_csv("fitness_test.csv")
features = ["pushup_count", "run_time_2km", "situp_count"]

print("데이터 크기:", fitness.shape)
print("결측치 수:", fitness.isna().sum().to_dict())
print(fitness.head(3).to_string(index=False))
```

```text
데이터 크기: (100, 4)
결측치 수: {'soldier_id': 0, 'pushup_count': 0, 'run_time_2km': 0, 'situp_count': 0}
soldier_id  pushup_count  run_time_2km  situp_count
      S001            68           488           41
      S002            58           567           26
      S003            44           608           26
```

현재 파일에는 결측치가 없습니다. Scaler는 결측치를 채우는 도구가 아니므로, 누락된 값이 있는 다른 파일을 사용할 때는 먼저 결측치 처리 방식을 정합니다.

`fitness_test.csv`의 열 이름은 `pushup_count`와 `situp_count`입니다. 중간에 `_`를 더 넣은 `push_up_count`나 `sit_up_count`로 접근하면 `KeyError`가 발생합니다. 열 이름이 헷갈릴 때는 `fitness.columns.tolist()`로 확인합니다. `soldier_id`는 식별자이므로 Scaling 대상에서 제외합니다.

| 열 | 최소값 | 최대값 | 단위 |
| --- | --- | --- | --- |
| `pushup_count` | 30 | 79 | 회 |
| `run_time_2km` | 480 | 659 | 초 |
| `situp_count` | 25 | 68 | 회 |

### 3-2. 원본과 변환 결과를 함께 저장합니다

```python
scaler = MinMaxScaler()
scaled_values = scaler.fit_transform(fitness[features])

scaled_df = pd.DataFrame(
    scaled_values,
    index=fitness.index,
    columns=[f"{col}_scaled" for col in features],
)
fitness_scaled = pd.concat([fitness, scaled_df], axis=1)
fitness_scaled.to_csv("fitness_scaled.csv", index=False)

for col in features:
    print(f"{col}: 최소 {fitness[col].min()}, 최대 {fitness[col].max()}")
print("저장할 데이터 크기:", fitness_scaled.shape)
```

```text
pushup_count: 최소 30, 최대 79
run_time_2km: 최소 480, 최대 659
situp_count: 최소 25, 최대 68
저장할 데이터 크기: (100, 7)
```

여기서는 전체 체력 기록의 범위를 확인하고 정리 파일을 만듭니다. 예측 성능을 평가할 때는 데이터를 먼저 나누고 훈련 데이터에만 Scaler를 `fit`합니다.

`fit_transform()`에는 두 작업이 들어 있습니다. `fit()`으로 최소·최대값을 기억하고, `transform()`으로 그 기준을 적용합니다. 기본 반환값인 NumPy `ndarray`에는 pandas 인덱스가 없으므로 DataFrame으로 만들 때 원본의 `index`를 지정합니다. `_scaled` 접미사는 원본 열과 변환한 열을 구분합니다.

| S001의 기록 | 원본 | 변환 후 |
| --- | --- | --- |
| `pushup_count` | 68 | 0.775510 |
| `run_time_2km` | 488 | 0.044693 |
| `situp_count` | 41 | 0.372093 |

S001의 달리기 기록 488초는 가장 빠른 480초에 가까워 0.044693이 됩니다. 팔굽혀펴기 68회는 최소 30회보다 최대 79회에 가까워 0.775510이 됩니다. 같은 0\~1 숫자라도 해석 방향은 서로 다릅니다.

### 3-3. 변환 결과의 범위를 확인합니다

```python
scaled_columns = [f"{col}_scaled" for col in features]
print(fitness_scaled[scaled_columns].agg(["min", "max"]).to_string())

np.testing.assert_allclose(scaled_df.min().to_numpy(), 0.0, atol=1e-12)
np.testing.assert_allclose(scaled_df.max().to_numpy(), 1.0, atol=1e-12)
```

```text
     pushup_count_scaled  run_time_2km_scaled  situp_count_scaled
min                  0.0                  0.0                 0.0
max                  1.0                  1.0                 1.0
```

소수점 연산에는 작은 오차가 생길 수 있습니다. 따라서 `== 1.0`만으로 확인하기보다 `np.testing.assert_allclose()`처럼 허용 오차를 두고 비교합니다. `index=False`는 DataFrame의 인덱스를 CSV의 별도 열로 저장하지 않도록 하는 옵션입니다.

### 3-4. DataFrame으로 바로 받는 방법도 있습니다

```python
scaler_df = MinMaxScaler().set_output(transform="pandas")
scaled_df_direct = scaler_df.fit_transform(fitness[features]).add_suffix("_scaled")

print(type(scaled_df_direct).__name__)
print("원본과 인덱스 일치:", scaled_df_direct.index.equals(fitness.index))
```

```text
DataFrame
원본과 인덱스 일치: True
```

`set_output(transform="pandas")`를 사용하면 변환 결과를 DataFrame으로 받아 열 이름과 인덱스를 이어서 사용할 수 있습니다. NumPy 배열을 직접 DataFrame으로 감싸는 방식은 이름을 세밀하게 지정하기 좋고, `set_output()` 방식은 pandas 작업을 이어 가기 편합니다.

### 3-5. 같은 데이터를 표준화하면 기준이 달라집니다

```python
standardizer = StandardScaler().set_output(transform="pandas")
standardized = standardizer.fit_transform(fitness[features])
standard_summary = pd.DataFrame({
    "mean": standardized.mean(),
    "std_ddof0": standardized.std(ddof=0),
})
print(standard_summary.round(6).to_string())
```

```text
              mean  std_ddof0
pushup_count  -0.0        1.0
run_time_2km  -0.0        1.0
situp_count    0.0        1.0
```

같은 세 열을 StandardScaler로 바꾸면 평균은 0에 가깝고 표준편차는 1이 됩니다. 출력에서 -0.0이 보이면 부동소수점 연산에서 생긴 아주 작은 음수의 반올림 결과입니다. 이때 확인하는 기준은 범위가 0\~1인지가 아니라 평균과 표준편차입니다.

StandardScaler는 표준편차를 `ddof=0`으로 계산합니다. pandas의 `std()` 기본값은 `ddof=1`이므로 위 코드처럼 `std(ddof=0)`으로 기준을 맞춰 확인합니다. 훈련 데이터에서 학습한 기준을 다른 데이터에 적용하면 그 데이터의 평균까지 항상 0이 되는 것은 아닙니다.

## 4. Scaling을 했다고 비교 기준까지 정해지는 것은 아닙니다

### 4-1. 달리기는 값이 작을수록 좋은 기록입니다

팔굽혀펴기와 윗몸일으키기는 횟수가 많을수록 좋은 기록이고, 달리기는 시간이 짧을수록 좋은 기록입니다. MinMaxScaler는 이 의미를 판단하지 않습니다. 모든 열에서 원본 값이 클수록 변환값도 커집니다.

```python
fitness_for_score = fitness_scaled.copy()
fitness_for_score["run_performance_scaled"] = (
    1 - fitness_for_score["run_time_2km_scaled"]
)
print(fitness_for_score.loc[0, ["run_time_2km_scaled", "run_performance_scaled"]].to_string())
```

```text
run_time_2km_scaled       0.044693
run_performance_scaled    0.955307
```

종합 점수를 설계할 때 모든 지표를 “클수록 좋은 값”으로 맞추고 싶다면 달리기만 `1 - scaled_value`로 뒤집을 수 있습니다. 이는 **점수 방향을 정하는 추가 선택**입니다. 모델 입력을 준비할 때 반드시 해야 하는 단계는 아닙니다. 세 지표를 같은 가중치로 더할지, 다른 가중치를 줄지도 평가 목적에 맞춰 정합니다.

### 4-2. 부대마다 따로 fit하면 같은 기록이 다르게 보입니다

최소 30회·최대 80회인 집단에서 50회는 0.4입니다. 최소 40회·최대 60회인 집단에서는 같은 50회가 0.5입니다. 부대마다 별도로 MinMaxScaler를 학습하면 같은 수행 기록이 다른 숫자로 바뀝니다.

> **집단 간 비교에서는 공통 기준을 사용합니다.** 공통 모집단의 최소·최대값이나 미리 정한 평가 기준을 사용하고, 예측 모델 평가에서는 훈련 데이터로 학습한 Scaler를 검증·테스트 데이터에도 재사용합니다.

### 4-3. 새 데이터는 0\~1 밖으로 나올 수 있습니다

```python
train_values = np.array([[10.0], [20.0]])
new_values = np.array([[5.0], [30.0]])

range_scaler = MinMaxScaler().fit(train_values)
clipped_scaler = MinMaxScaler(clip=True).fit(train_values)

print("기본 변환:", range_scaler.transform(new_values).ravel())
print("clip=True:", clipped_scaler.transform(new_values).ravel())
```

```text
기본 변환: [-0.5  2. ]
clip=True: [0. 1.]
```

10\~20을 기준으로 학습한 뒤 5와 30을 변환하면 -0.5와 2가 됩니다. 새 값을 보고 다시 `fit()`하면 기존 기준이 바뀌므로, 테스트 데이터도 꼭 0\~1로 만들겠다는 이유로 재학습하지 않습니다. `clip=True`는 범위 밖 값을 경계값으로 잘라내지만, 20보다 얼마나 큰지 같은 정보가 사라집니다.

### 4-4. 이상치가 하나 있어도 대부분의 값이 눌릴 수 있습니다

```python
small_example = np.array([[0.0], [1.0], [2.0], [1000.0]])
print(MinMaxScaler().fit_transform(small_example).ravel())
```

```text
[0.    0.001 0.002 1.   ]
```

1000이 최대값이 되면 0·1·2는 0·0.001·0.002로 모입니다. 범위는 맞췄지만 나머지 값의 차이는 좁아졌습니다. 이상치가 입력 오류인지 실제 관측인지 먼저 확인하고, 기준의 영향을 줄이고 싶다면 중앙값과 IQR을 사용하는 RobustScaler를 비교해 봅니다.

### 4-5. 모든 모델에 같은 Scaling이 필요한가요?

| 모델·분석 | Scaling을 살펴볼 이유 |
| --- | --- |
| KNN·K-means | 거리를 계산하므로 단위가 큰 Feature가 거리에 크게 기여할 수 있습니다. |
| SVM·규제가 있는 선형 모델 | 거리·커널 계산과 규제의 효과가 Feature 크기에 영향을 받습니다. |
| PCA | 분산이 큰 Feature가 성분에 더 크게 반영될 수 있습니다. |
| Decision Tree·Random Forest | 일반적인 열별 선형 Scaling은 값의 순서를 유지하므로 대체로 영향이 작습니다. |

큰 단위의 Feature가 항상 중요한 Feature로 학습된다고 단정할 수는 없습니다. 모델이 어떻게 거리와 분산을 계산하고 계수를 학습하는지에 따라 달라집니다. Scaling의 필요성과 방법은 모델의 구조와 데이터 특성에 맞춰 선택하고, 같은 평가 조건에서 비교합니다.

## 5. concat()은 행의 순서보다 인덱스를 봅니다

`pd.concat([...], axis=1)`은 DataFrame을 옆으로 붙입니다. 이때 같은 인덱스끼리 연결합니다. 현재 CSV를 바로 읽었을 때는 인덱스가 0부터 시작하므로 문제가 드러나지 않지만, 필터링 뒤에는 다를 수 있습니다.

```python
index_example = pd.DataFrame({"value": [10.0, 20.0]}, index=[10, 20])
index_scaled = MinMaxScaler().fit_transform(index_example[["value"]])

wrong_scaled = pd.DataFrame(index_scaled, columns=["value_scaled"])
right_scaled = pd.DataFrame(
    index_scaled, index=index_example.index, columns=["value_scaled"]
)

wrong_join = pd.concat([index_example, wrong_scaled], axis=1)
right_join = pd.concat([index_example, right_scaled], axis=1)
print("인덱스를 생략한 결과:")
print(wrong_join.to_string())
print("인덱스를 맞춘 결과:")
print(right_join.to_string())
```

```text
인덱스를 생략한 결과:
    value  value_scaled
10   10.0           NaN
20   20.0           NaN
0     NaN           0.0
1     NaN           1.0
인덱스를 맞춘 결과:
    value  value_scaled
10   10.0           0.0
20   20.0           1.0
```

원본 인덱스는 10·20이고, 인덱스를 생략한 변환 결과는 0·1입니다. 서로 같은 인덱스가 없어서 4행이 되고 `NaN`이 생깁니다. `index=index_example.index`를 지정하면 2행이 유지됩니다. `ignore_index=True`를 `axis=1`과 함께 쓰면 열 이름을 다시 번호로 만들 뿐, 행의 인덱스 불일치는 해결하지 않습니다.

## 6. 실습 2: 보직과 지역을 숫자로 표현합니다

### 6-1. 범주에 순서가 있는지 먼저 생각합니다

보직의 보병·의무병·정비병과 지역의 강원도·경기도·경상도에는 수치적인 크기 순서가 없습니다. 반면 숙련도를 초급·중급·고급으로 정했다면 순서가 있습니다. 두 경우를 같은 방식으로 표현하면 숫자가 원래 의미에 없던 관계를 만들 수 있습니다.

| 표현할 값 | 예시 | 사용할 표현 |
| --- | --- | --- |
| 순서가 없는 Feature | 보직, 지역 | One-Hot Encoding을 우선 비교합니다. |
| 순서가 있는 Feature | 초급, 중급, 고급 | 의미에 맞는 순서를 지정한 Ordinal Encoding을 사용할 수 있습니다. |
| 분류할 Target | 예측할 보직 이름 | 필요하면 LabelEncoder로 Target 이름을 정수 코드에 대응시킵니다. |

### 6-2. 보직을 LabelEncoder로 변환하고 대응 관계를 기록합니다

```python
from sklearn.preprocessing import LabelEncoder

soldiers = pd.read_csv("soldier_info.csv")
label_encoder = LabelEncoder()
soldiers["position_encoded"] = label_encoder.fit_transform(soldiers["position"])

position_mapping = dict(zip(
    label_encoder.classes_.tolist(),
    label_encoder.transform(label_encoder.classes_).tolist(),
))
print("보직 대응 관계:", position_mapping)
print(soldiers[["soldier_id", "position", "position_encoded"]].head(3).to_string(index=False))
```

```text
보직 대응 관계: {'보병': 0, '의무병': 1, '정비병': 2, '통신병': 3, '포병': 4}
soldier_id position  position_encoded
      S101      의무병                 1
      S102       포병                 4
      S103      통신병                 3
```

`classes_`에는 인코더가 학습한 범주가 들어 있습니다. `zip()`은 범주와 코드를 짝지으며, `dict()`는 그 쌍을 Dictionary로 만듭니다. 코드 0\~4는 보직의 우열이 아니라 범주를 식별하는 번호입니다.

| 보직 | 코드 |
| --- | --- |
| 보병 | 0 |
| 의무병 | 1 |
| 정비병 | 2 |
| 통신병 | 3 |
| 포병 | 4 |

문자열의 정렬 순서에 따라 이번 데이터에서는 보병이 0, 의무병이 1이 됩니다. 데이터에서 먼저 등장한 보직에 0을 붙이는 방식은 아닙니다. 저장할 때는 데이터뿐 아니라 대응 관계도 함께 기록해 두면 코드를 해석하기 쉽습니다.

> **LabelEncoder의 공식 용도는 입력 Feature인 `X`가 아니라 Target인 `y`의 라벨 변환입니다.** 보직을 숫자로 바꾸는 동작은 확인할 수 있지만, 보직을 다른 예측의 입력으로 사용할 때는 OneHotEncoder나 OrdinalEncoder를 데이터 의미에 맞게 선택합니다.

### 6-3. 지역을 One-Hot Encoding합니다

```python
region_encoded = pd.get_dummies(
    soldiers["region"], prefix="region", dtype="uint8"
)
encoded_soldiers = pd.concat([soldiers, region_encoded], axis=1)
encoded_soldiers.to_csv(
    "encoded_soldiers.csv", index=False, encoding="utf-8-sig"
)

print("지역별 열:", region_encoded.columns.tolist())
print("변환 열의 dtype:", region_encoded.dtypes.unique().tolist())
print("저장할 데이터 크기:", encoded_soldiers.shape)
```

```text
지역별 열: ['region_강원도', 'region_경기도', 'region_경상도', 'region_전라도', 'region_충청도']
변환 열의 dtype: [dtype('uint8')]
저장할 데이터 크기: (100, 10)
```

| 지역 | region\_강원도 | region\_경기도 | region\_경상도 | region\_전라도 | region\_충청도 |
| --- | --- | --- | --- | --- | --- |
| 경상도 | 0 | 0 | 1 | 0 | 0 |
| 경상도 | 0 | 0 | 1 | 0 | 0 |
| 충청도 | 0 | 0 | 0 | 0 | 1 |

지역은 5종이므로 새로운 열도 5개입니다. 경상도인 행에서는 `region_경상도`만 1이고 나머지는 0입니다. 원본 4열에 `position_encoded` 1열과 지역 5열을 추가하여 100행·10열을 저장합니다.

현재 `pd.get_dummies()`의 기본 `dtype`은 `bool`입니다. 기본 설정으로 호출하면 `True`/`False`가 나오며, 위 코드에서는 CSV에 0/1이 보이도록 `dtype="uint8"`을 명시했습니다. 두 표현은 같은 범주 여부를 나타냅니다.

`utf-8-sig`는 UTF-8에 BOM을 더해 저장합니다. Excel처럼 인코딩을 자동 판별하는 도구에서 한글 CSV를 열 때 도움이 됩니다. 인코딩은 파일의 문자를 읽는 방식이고, Label Encoding이나 One-Hot Encoding은 범주를 숫자로 표현하는 방식입니다.

### 6-4. 원본을 보관하는 파일과 모델 입력은 구별합니다

`encoded_soldiers`에는 원본 문자열도 남아 있어 변환을 검토하기 좋습니다. 모델에 넣을 때는 필요한 숫자 열만 선택합니다. `soldier_id`를 일반적인 수치 Feature처럼 쓰거나, 원본 `position`·`region` 문자열까지 무조건 함께 전달하지 않습니다.

```python
encoded_feature_columns = ["age", "position_encoded", *region_encoded.columns]
review_numeric = encoded_soldiers[encoded_feature_columns]
print("숫자형 열만 선택한 크기:", review_numeric.shape)
```

```text
숫자형 열만 선택한 크기: (100, 7)
```

위 선택은 숫자형 열을 고르는 문법을 확인하는 예제입니다. 실제 입력으로 보직 코드를 사용할지는 모델과 범주의 의미에 맞춰 판단합니다. 다음 절에서는 보직과 지역을 모두 One-Hot Encoding하는 방법을 살펴봅니다.

## 7. 인코딩 방법은 범주의 의미와 새 데이터에 맞춰 선택합니다

### 7-1. 정수 코드는 순서와 거리로 읽힐 수 있습니다

보병=0, 의무병=1, 정비병=2라고 정하면 거리 기반 모델은 보병과 정비병의 차이를 2로, 보병과 의무병의 차이를 1로 계산할 수 있습니다. 선형 모델은 코드가 증가할수록 효과가 일정하게 변하는 관계를 가정하게 됩니다. 이런 관계가 실제 보직의 의미에 맞는지 확인해야 합니다.

One-Hot Encoding은 보직별 열을 나누어 이런 임의의 숫자 순서를 피합니다. 범주 수가 많아질수록 열 수도 늘어나므로, 표로 보기 쉬운 방식과 모델에 효율적으로 입력하는 방식을 함께 고려합니다.

### 7-2. 순서가 있는 범주는 순서를 직접 지정합니다

```python
from sklearn.preprocessing import OrdinalEncoder

level_example = pd.DataFrame({"level": ["초급", "고급", "중급"]})
level_encoder = OrdinalEncoder(categories=[["초급", "중급", "고급"]])
print(level_encoder.fit_transform(level_example).ravel())
```

```text
[0. 2. 1.]
```

이 예제의 0·1·2는 초급·중급·고급의 순서를 나타냅니다. `categories`를 직접 지정하면 문자열 정렬 순서 대신 원하는 순서를 사용합니다. 다만 0→1과 1→2의 실제 능력 차이까지 같은 것은 아닙니다. 모델이 숫자 간 간격을 어떻게 이용하는지도 살펴봅니다.

### 7-3. get\_dummies()를 각각 실행하면 열 구성이 달라질 수 있습니다

모델을 만들 때는 훈련 데이터(Train)로 학습하고, 별도로 나눈 테스트 데이터(Test)로 성능을 확인합니다. 이후 실제 예측에 사용할 데이터도 들어옵니다. 이때 **학습할 때와 예측할 때 각 열이 같은 의미를 가져야 합니다.** 아래 예제의 새 데이터는 Test 데이터나 이후 들어오는 예측 데이터를 떠올리면 됩니다.

`get_dummies()`는 호출할 때 전달받은 범주를 기준으로 열을 만듭니다. 일반 문자열 Series에 적용하면 그 Series에 들어 있는 지역만 열로 생성됩니다. 이전에 다른 데이터로 실행했던 결과를 기억하고 재사용하지 않습니다. 아래에서는 0과 1로 읽기 쉽도록 `dtype="uint8"`을 지정합니다.

| 구분 | region에 들어 있는 값 | 생성되는 열 |
| --- | --- | --- |
| 훈련 데이터 | 강원도, 경기도, 강원도 | `region_강원도`, `region_경기도` |
| 새 데이터 | 경기도, 제주도 | `region_경기도`, `region_제주도` |

```python
train_region_example = pd.DataFrame({"region": ["강원도", "경기도", "강원도"]})
new_region_example = pd.DataFrame({"region": ["경기도", "제주도"]})

train_dummies = pd.get_dummies(
    train_region_example["region"], prefix="region", dtype="uint8"
)
new_dummies = pd.get_dummies(
    new_region_example["region"], prefix="region", dtype="uint8"
)

print("훈련 데이터의 Encoding 결과")
print(train_dummies.to_string(index=False))
print("새 데이터의 Encoding 결과")
print(new_dummies.to_string(index=False))
```

```text
훈련 데이터의 Encoding 결과
 region_강원도  region_경기도
          1           0
          0           1
          1           0
새 데이터의 Encoding 결과
 region_경기도  region_제주도
          1           0
          0           1
```

훈련 데이터에는 제주도가 없으므로 `region_제주도` 열이 없습니다. 새 데이터에는 강원도가 없으므로 `region_강원도` 열이 없습니다. 두 결과 모두 열은 2개지만, **첫 번째 열과 두 번째 열이 가리키는 지역이 서로 다릅니다.**

| 열의 위치 | 훈련 데이터에서의 의미 | 새 데이터에서의 의미 |
| --- | --- | --- |
| 첫 번째 열 | 강원도인지 여부 | 경기도인지 여부 |
| 두 번째 열 | 경기도인지 여부 | 제주도인지 여부 |

여기서 새 데이터의 경기도 행을 살펴봅니다. 새 데이터의 열 순서는 `[경기도, 제주도]`이므로 경기도는 `[1, 0]`입니다. 그런데 모델이 학습한 열 순서는 `[강원도, 경기도]`입니다. 열 이름 없이 숫자 배열만 같은 위치에 전달하면, 모델은 그 `[1, 0]`을 강원도 입력으로 받게 됩니다.

| 실제 지역 | 새 데이터에서 만든 배열 | 훈련 데이터의 열 순서로 읽으면 |
| --- | --- | --- |
| 경기도 | `[1, 0]` | 강원도에 해당하는 입력이 됩니다. |
| 제주도 | `[0, 1]` | 경기도에 해당하는 입력이 됩니다. |

scikit-learn 모델에 DataFrame을 전달하면 Feature 이름의 불일치를 검사하는 경우 오류가 발생합니다. 반면 학습과 예측 모두 `to_numpy()`로 변환한 배열을 전달하면 열 이름이 사라집니다. 열 개수가 같다는 이유로 입력이 받아들여져도 의미가 잘못 연결될 수 있습니다. **배열의 크기가 같다는 사실만으로 올바른 입력이라고 판단하면 안 됩니다.**

> **열 구성을 맞춘다는 것은 같은 자리에 같은 질문을 놓는 것입니다.** 첫 번째 열이 “강원도인가요?”, 두 번째 열이 “경기도인가요?”였다면 새 데이터에도 그 질문과 순서를 그대로 사용합니다. 행 수는 달라도 되지만, 모델에 전달하는 Feature의 이름과 순서는 유지합니다.

pandas로 직접 맞추려면 훈련 데이터의 열 목록을 기준으로 `reindex()`를 사용합니다. 새 데이터에 없는 훈련 열은 추가하고, 훈련 열 목록에 없는 열은 제외하며, 순서까지 맞춥니다.

```python
new_dummies_aligned = new_dummies.reindex(
    columns=train_dummies.columns,
    fill_value=0,
)

print("훈련 데이터 기준으로 맞춘 새 데이터")
print(new_dummies_aligned.to_string(index=False))
print("열 이름과 순서 일치:", new_dummies_aligned.columns.equals(train_dummies.columns))
```

```text
훈련 데이터 기준으로 맞춘 새 데이터
 region_강원도  region_경기도
          0           1
          0           0
열 이름과 순서 일치: True
```

-   `columns=train_dummies.columns`: 훈련 데이터의 `[region_강원도, region_경기도]`를 출력 열 목록과 순서로 사용합니다.
-   `fill_value=0`: 새로 추가하는 `region_강원도` 열을 0으로 채웁니다. 새 데이터에는 강원도가 없으므로 이 값이 맞습니다.
-   `region_경기도`: 기존 값을 열 이름에 맞춰 유지합니다. 경기도 행은 `[0, 1]`이 됩니다.
-   `region_제주도`: 훈련 데이터의 열 목록에 없으므로 결과에서 제외됩니다. 제주도 행은 `[0, 0]`이 됩니다.

이제 경기도는 올바르게 표현되지만, 제주도를 학습한 것은 아닙니다. 이 예제처럼 모든 범주 열을 유지하고 결측치가 없는 설정에서 `[0, 0]`은 “강원도도 경기도도 아닌 값”입니다. 제주도, 서울 등 어떤 새로운 지역인지는 이 배열만으로 구분할 수 없습니다.

처음 보는 지역을 확인하려면 원본 값을 훈련 데이터의 범주 목록과 비교합니다. 새 범주를 모두 0으로 처리할지, 입력 오류로 볼지, 데이터를 보강해 모델을 다시 학습할지는 이 확인 결과를 바탕으로 정합니다.

```python
known_regions = train_region_example["region"].unique()
unknown_mask = ~new_region_example["region"].isin(known_regions)

print("처음 보는 지역:", new_region_example.loc[unknown_mask, "region"].tolist())
```

```text
처음 보는 지역: ['제주도']
```

`reindex()`는 출력 열을 정리하고, 위 조건식은 새 범주를 찾습니다. 두 작업을 함께 사용해야 열을 맞추는 과정에서 제주도 정보가 사라졌다는 사실도 확인할 수 있습니다. 처음 보는 지역에 새 열만 추가하면 기존 모델이 기대하는 입력 구성도 바뀌므로, 기존 모델에 바로 넣을 수는 없습니다.

위 예제는 기본 `drop_first=False`를 사용합니다. 데이터마다 `drop_first=True`를 따로 적용하면 제거되는 기준 범주도 달라질 수 있어, 열을 맞추는 것만으로 같은 표현이 되지 않을 수 있습니다. 학습·예측 과정에서는 다음 절의 OneHotEncoder처럼 범주 목록과 처리 규칙을 저장하는 방식을 사용하면 관리하기 편합니다.

정리하면, `get_dummies()`를 훈련 데이터와 새 데이터에 각각 사용하는 것 자체가 문제는 아닙니다. **각 결과를 모델에 넣기 전에 훈련 데이터의 열 이름과 순서로 맞추고, 새 범주의 처리 방식도 정해야 합니다.**

### 7-4. OneHotEncoder는 학습한 범주 구성을 재사용합니다

```python
from sklearn.preprocessing import OneHotEncoder

region_encoder = OneHotEncoder(
    handle_unknown="ignore", sparse_output=False, dtype=np.int64
).set_output(transform="pandas")

train_encoded_example = region_encoder.fit_transform(train_region_example)
new_encoded_example = region_encoder.transform(new_region_example)
print(new_encoded_example.to_string(index=False))
```

```text
 region_강원도  region_경기도
          0           1
          0           0
```

훈련 데이터에서 학습한 강원도·경기도 열이 새 데이터에도 유지됩니다. `handle_unknown="ignore"`는 처음 보는 제주도를 모든 열이 0인 행으로 처리합니다. 기본값인 `handle_unknown="error"`는 이런 경우 오류를 발생시킵니다. 0으로 처리해도 모델이 제주도의 의미를 새로 학습하는 것은 아니므로, 새 범주가 자주 나타나는지도 따로 확인합니다.

현재 옵션 이름은 `sparse_output`입니다. scikit-learn 1.2에서 기존 `sparse`라는 이름이 바뀌었습니다. 위 코드는 표로 보기 위해 `sparse_output=False`를 사용하며, 기본 `True`는 Sparse CSR 형식으로 반환합니다. pandas DataFrame 출력을 사용할 때는 이처럼 Dense 출력으로 설정합니다.

| 상황 | 선택·옵션 | 확인할 점 |
| --- | --- | --- |
| 일회성 데이터 정리·CSV 출력 | `pd.get_dummies(..., dtype="uint8")` | 기본은 Dense DataFrame입니다. 결측치와 출력 열을 확인합니다. |
| 훈련과 새 데이터의 범주 구성 유지 | OneHotEncoder | 훈련 데이터에서 `fit`하고 새 데이터에는 `transform`합니다. |
| 범주가 매우 많음 | `sparse_output=True` | Sparse 형식은 0을 모두 저장하지 않지만 추가 인덱스 정보가 필요합니다. 작은 데이터에서 항상 더 작지는 않습니다. |
| 드문 범주를 묶고 싶음 | `min_frequency`, `max_categories` | 서로 다른 범주를 하나로 합치는 의미 변화를 고려합니다. |
| 입력에 결측치가 있음 | `dummy_na=True` 또는 결측치 대체 | `get_dummies` 기본 설정의 결측치는 모든 열이 0입니다. |
| 기준 범주 열을 제거함 | `drop_first=True` 또는 `drop="first"` | 무규제 선형 모델의 완전한 다중공선성을 줄일 수 있지만 모든 모델에서 필수는 아닙니다. |

`get_dummies()` 결과에 0이 많다고 해서 실제 Sparse 자료구조가 되는 것은 아닙니다. pandas는 `sparse=True`로 SparseArray 기반 열을 만들 수 있고, scikit-learn의 OneHotEncoder는 Sparse 출력이 기본입니다.

기준 범주를 제거하면 그 범주는 모두 0으로 표현됩니다. 여기에 `handle_unknown="ignore"`를 함께 쓰면 처음 보는 범주도 모두 0이므로 기준 범주와 구분되지 않을 수 있습니다. 저장 공간이나 열 개수를 줄이는 선택이 해석에 어떤 영향을 주는지 확인합니다.

## 8. 숫자와 범주를 함께 처리할 때는 ColumnTransformer를 사용합니다

병사 정보에서 나이는 Scaling하고, 보직과 지역은 One-Hot Encoding한다고 정해 봅니다. ColumnTransformer를 사용하면 열마다 다른 전처리를 하나로 구성할 수 있습니다. Session01에서 다룬 데이터 누수 방지 원칙도 함께 적용합니다.

```python
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split

X = soldiers[["age", "position", "region"]]
X_train, X_test = train_test_split(X, test_size=0.2, random_state=42)

preprocessor = ColumnTransformer([
    ("numeric", StandardScaler(), ["age"]),
    ("categorical", OneHotEncoder(
        handle_unknown="ignore", sparse_output=False
    ), ["position", "region"]),
], remainder="drop").set_output(transform="pandas")

X_train_ready = preprocessor.fit_transform(X_train)
X_test_ready = preprocessor.transform(X_test)

print("훈련 데이터 변환:", X_train_ready.shape)
print("테스트 데이터 변환:", X_test_ready.shape)
print("테스트 인덱스 유지:", X_test_ready.index.equals(X_test.index))
print("출력 열:", preprocessor.get_feature_names_out().tolist())
```

```text
훈련 데이터 변환: (80, 11)
테스트 데이터 변환: (20, 11)
테스트 인덱스 유지: True
출력 열: ['numeric__age', 'categorical__position_보병', 'categorical__position_의무병', 'categorical__position_정비병', 'categorical__position_통신병', 'categorical__position_포병', 'categorical__region_강원도', 'categorical__region_경기도', 'categorical__region_경상도', 'categorical__region_전라도', 'categorical__region_충청도']
```

변환 결과는 나이 1열, 보직 5열, 지역 5열로 총 11열입니다. `numeric__age`처럼 이름 앞에 붙은 부분은 어느 전처리에서 나온 열인지 알려 줍니다. `remainder="drop"`은 따로 지정하지 않은 열을 결과에서 제외합니다.

-   `fit_transform(X_train)`: 훈련 데이터의 나이 평균·표준편차와 범주 목록을 학습하고 변환합니다.
-   `transform(X_test)`: 저장한 평균·표준편차와 같은 범주 열을 테스트 데이터에 적용합니다.
-   실제 예측 모델과 교차 검증을 구성할 때는 이 전처리를 모델과 함께 Pipeline에 넣습니다. Fold마다 전처리를 훈련 부분에서 학습해야 합니다.

> **입력 열을 선택하고 데이터를 나눈 뒤 전처리 기준을 학습합니다.** 테스트 데이터를 보고 Scaler나 Encoder를 다시 `fit`하면 평가할 데이터의 정보가 전처리에 섞입니다.

## 9. 실습 3: 영상 경로가 실제 파일을 가리키는지 확인합니다

### 9-1. CSV의 경로는 상대 경로입니다

```python
import os
from pathlib import Path

videos = pd.read_csv("video_metadata.csv")
print(videos.to_string(index=False))
```

```text
video_id       timestamp              file_path
    V001 2024-04-21 3:00 data/ops/cam1/V001.mp4
    V002 2024-04-21 3:10 data/ops/cam1/V002.mp4
    V003 2024-04-21 3:20 data/ops/cam1/V003.mp4
```

CSV에는 `data/ops/cam1/V001.mp4`처럼 맨 앞에 `/`가 없는 상대 경로가 들어 있습니다. `os.path.exists()`에 이 값을 그대로 전달하면 **현재 작업 폴더**를 기준으로 찾습니다. CSV 파일의 위치를 자동으로 기준 삼는 것은 아닙니다. 현재 기준 위치는 `Path.cwd()`로 확인할 수 있습니다.

예를 들어 기준 폴더가 `project`라면 실제로 찾을 위치는 `project/data/ops/cam1/V001.mp4`입니다. Colab에서 실행하더라도 CSV에 이름이 적혀 있다는 이유로 Drive의 영상 파일을 자동으로 읽지는 않습니다. 필요한 파일을 내려받거나 Drive를 연결한 뒤 기준 폴더를 맞춥니다.

### 9-2. exists 컬럼을 추가하고 목록을 나눕니다

```python
videos["exists"] = videos["file_path"].apply(
    lambda path: os.path.exists(path)
)
valid_videos = videos.loc[videos["exists"]].copy()
missing_videos = videos.loc[~videos["exists"]].copy()

valid_videos.to_csv("valid_videos.csv", index=False)
missing_videos.to_csv("missing_videos.csv", index=False)

print("존재하는 경로:", len(valid_videos))
print("확인되지 않는 경로:", len(missing_videos))
```

`lambda path: os.path.exists(path)`는 경로 하나를 받아 존재 여부를 반환하는 작은 함수입니다. `Series.apply()`가 각 경로에 적용하여 `True`/`False` 컬럼을 만듭니다. `True`인 행은 그대로, `False`인 행은 `~`로 반전한 조건으로 선택합니다.

존재하는 파일 수는 실제 폴더에 어떤 파일이 있는지에 따라 달라집니다. 모두 `False`라면 파일이 빠졌는지와 기준 폴더가 맞는지를 함께 확인합니다. 권한 문제로 존재 여부를 확인하지 못하는 경우도 있습니다.

### 9-3. exists()와 is\_file()은 확인 범위가 다릅니다

| 함수 | 확인하는 대상 | 영상 목록에서의 의미 |
| --- | --- | --- |
| `os.path.exists(path)` | 파일이나 Directory 등 경로의 존재 | Directory도 `True`입니다. |
| `os.path.isfile(path)` | 일반 파일 여부 | Directory를 영상 파일로 분류하는 실수를 피합니다. |
| `Path(path).is_file()` | `Path` 객체가 가리키는 일반 파일 여부 | 기준 폴더 결합과 함께 표현하기 편합니다. |

영상 목록을 만들 때는 `is_file()`이 목적에 더 잘 맞습니다. 확장자가 `.mp4`라는 사실이나 파일이 존재한다는 사실만으로 영상이 정상 재생되는지까지 확인되지는 않습니다. 실제 분석 단계에서는 파일을 열어 읽을 수 있는지도 확인합니다.

### 9-4. 기준 폴더를 명시하고 비어 있는 경로도 처리합니다

```python
csv_path = Path("video_metadata.csv").resolve()
BASE_DIR = csv_path.parent
videos_checked = pd.read_csv(csv_path)

def is_existing_file(value):
    if not isinstance(value, str) or not value.strip():
        return False
    path = Path(value.strip())
    if not path.is_absolute():
        path = BASE_DIR / path
    return path.is_file()

videos_checked["exists"] = videos_checked["file_path"].map(is_existing_file)
valid_files = videos_checked.loc[videos_checked["exists"]].copy()
missing_files = videos_checked.loc[~videos_checked["exists"]].copy()
valid_files.to_csv(csv_path.parent / "valid_videos.csv", index=False)
missing_files.to_csv(csv_path.parent / "missing_videos.csv", index=False)
```

여기서는 `data` 폴더가 CSV와 같은 기준 폴더 아래에 있다고 정하고 `BASE_DIR = csv_path.parent`를 사용합니다. 영상이 다른 위치에 있다면 그 위치에 맞춰 `BASE_DIR`을 바꿉니다. 절대 경로는 그대로 검사하고, 상대 경로에는 기준 폴더를 붙입니다.

파일 경로가 비어 있으면 `read_csv()`가 `NaN`으로 읽을 수 있습니다. 문자열인지 먼저 확인하여 `Path()`에 `NaN`이 전달되는 오류를 막습니다. `Series.map()`은 각 값에 같은 함수를 적용하는 동작을 간결하게 표현합니다. 조건이 길어지면 lambda보다 이름 있는 함수가 읽기 편합니다.

### 9-5. 작은 테스트 폴더로 동작을 확인합니다

V001과 V003은 있고 V002는 없는 상황을 임시 폴더에 만들어 봅니다. 존재 여부 검사만 확인하므로 내용이 비어 있는 테스트 파일을 사용합니다. `TemporaryDirectory`는 블록을 나갈 때 임시 폴더를 정리합니다.

```python
from tempfile import TemporaryDirectory

with TemporaryDirectory() as temp_dir:
    test_root = Path(temp_dir)
    camera_dir = test_root / "data" / "ops" / "cam1"
    camera_dir.mkdir(parents=True)
    for name in ["V001.mp4", "V003.mp4"]:
        (camera_dir / name).touch()

    path_example = videos[["video_id", "file_path"]].copy()
    path_example["exists"] = path_example["file_path"].map(
        lambda value: (test_root / value).is_file()
    )
    print(path_example[["video_id", "exists"]].to_string(index=False))
    print("확인된 파일:", int(path_example["exists"].sum()))
    print("누락된 파일:", int((~path_example["exists"]).sum()))
```

```text
video_id  exists
    V001    True
    V002   False
    V003    True
확인된 파일: 2
누락된 파일: 1
```

V001·V003은 `True`, V002는 `False`가 됩니다. 이렇게 기대하는 폴더 구조를 작게 만들어 두면 CSV의 경로 형식과 필터링 조건을 따로 확인할 수 있습니다.

## 10. 더 살펴보기: 드문 범주와 처음 본 범주를 처리합니다

지역이 수백 개라면 One-Hot 열도 계속 늘어납니다. 자주 등장하지 않는 범주를 하나로 묶으면 입력 크기를 줄일 수 있습니다. 이때도 어느 범주가 드문지는 Train에서 정합니다.

`min_frequency=2`는 학습 데이터에서 두 번 미만 나온 범주를 묶습니다. `handle_unknown="infrequent_if_exist"`는 처음 본 범주를 그 열로 보냅니다.

```python
import pandas as pd
from sklearn.preprocessing import OneHotEncoder

train = pd.DataFrame({"region": ["A", "A", "A", "A", "B", "C"]})
new = pd.DataFrame({"region": ["A", "D"]})
encoder = OneHotEncoder(
    min_frequency=2, handle_unknown="infrequent_if_exist",
    sparse_output=False,
)
encoder.fit(train)
result = pd.DataFrame(encoder.transform(new),
                      columns=encoder.get_feature_names_out())
print(result.to_string(index=False))
```

```text
 region_A  region_infrequent_sklearn
      1.0                        0.0
      0.0                        1.0
```

여기서는 B·C를 묶은 열이 있어 D도 그 열에 들어갑니다. Train에서 드문 범주 열이 만들어지지 않았다면 처음 본 범주는 해당 Feature의 모든 One-Hot 값이 0이 됩니다. 범주를 묶는 기준은 메모리와 구분 능력 사이의 선택이므로 Validation 결과도 함께 봅니다.

## 11. 다시 볼 때 기억할 문법과 질문

| 하려는 일 | 문법 | 기억할 점 |
| --- | --- | --- |
| 열별 범위 맞추기 | `MinMaxScaler()` | 새 값은 훈련 범위를 벗어날 수 있습니다. |
| 평균·표준편차 기준 맞추기 | `StandardScaler()` | 정규분포를 만드는 작업은 아닙니다. |
| DataFrame 출력 받기 | `set_output(transform="pandas")` | 열 이름과 인덱스를 유지하며 작업합니다. |
| 원본과 변환 열 연결 | `pd.concat([...], axis=1)` | 행은 인덱스로 정렬합니다. |
| Target 이름에 코드 대응 | `LabelEncoder()` | 코드는 순위가 아닙니다. |
| 순서가 있는 Feature 표현 | `OrdinalEncoder(categories=[...])` | 의미에 맞는 순서를 지정합니다. |
| 범주별 열 생성 | `pd.get_dummies(..., dtype="uint8")` | 기본 bool과 0/1 저장 방식을 구별합니다. |
| 훈련 범주 구성 재사용 | `OneHotEncoder(handle_unknown="ignore")` | 처음 보는 범주는 모든 열이 0입니다. |
| 열마다 다른 전처리 | `ColumnTransformer([...])` | 숫자와 범주를 따로 처리합니다. |
| 경로의 존재 확인 | `os.path.exists(path)` | 기준 폴더와 Directory 여부를 확인합니다. |
| 일반 파일 확인 | `Path(path).is_file()` | 정상 재생 여부는 별도 확인합니다. |
| 한글 CSV 저장 | `to_csv(..., encoding="utf-8-sig")` | 문자 인코딩과 범주 인코딩은 다른 개념입니다. |

1.  팔굽혀펴기와 달리기의 변환값은 모두 클수록 좋은 기록인가요?
2.  부대마다 최소·최대값을 따로 구해도 같은 체력 기록이 같은 숫자가 되나요?
3.  변환 결과를 원본 옆에 붙일 때 인덱스가 유지되어 있나요?
4.  보직에 붙인 0·1·2를 모델이 순서나 거리로 해석해도 되나요?
5.  훈련 때 없던 지역이 들어오면 열 구성과 값이 어떻게 처리되나요?
6.  영상의 상대 경로는 어느 폴더를 기준으로 찾으며, Directory까지 `True`로 분류하고 있지는 않나요?

스케일링은 숫자의 비교 기준을, Encoding은 범주의 표현 방식을 정합니다. Train에서 정한 기준과 새 데이터에 적용한 기준이 같은지부터 확인하면 코드의 흐름이 다시 떠오릅니다.

## 참고자료

### 실습 데이터와 노트북

-   **실습 자료**: [Session02 실습 폴더](https://drive.google.com/drive/folders/1TK9kCC1H317SvRwT9E3heCI-o9MqWN-r) · [session02\_정규화-및-인코딩.pdf](https://drive.google.com/file/d/16g6ny-ykGQYIUzSBWNw0I78pnlWVTe5n/view) · [session02.ipynb](https://drive.google.com/file/d/1a85vbF-rl59qCK8Ua-VTCkQ8i0uA06Uv/view)
-   **CSV 데이터**: [fitness\_test.csv](https://drive.google.com/file/d/1uWaHx20fOHkaVkHGsxe2dwvytwodHqCr/view) · [soldier\_info.csv](https://drive.google.com/file/d/1khYFnzYRtFEnT7X1wxcstezlT-3rbLoE/view) · [video\_metadata.csv](https://drive.google.com/file/d/1hC7ZwfKUmyqF4WIguYqoSyAu7Tofkmhd/view)
-   **심화 예제**: [심화 예제 자료](https://drive.google.com/file/d/1wG0fZ0uhBQ1tniHUVE42xxo2mhkdwzGf/view?usp=drivesdk "Google Drive에서 자료를 엽니다.") — 공부노트 01\~13의 Python 코드, 노트북, 예제 CSV와 실행 결과를 함께 받습니다.

### 연습문제

-   **문제**: [유형 02 문제](/cs/data-analysis/practice-02-tabular-modeling/) — 같은 장비의 반복 기록이 있을 때, 새로운 장비의 고장 여부와 정비 시간을 어떻게 평가할까요?
-   **풀이**: [유형 02 풀이](/cs/data-analysis/practice-02-tabular-modeling-solution/) — 장비별로 데이터를 나누고 전처리 Pipeline과 그룹 CV로 고장 분류·정비 시간 회귀 모델을 평가합니다.

### 공식 문서

-   **Scaling**: scikit-learn[MinMaxScaler](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.MinMaxScaler.html) — feature\_range, clip, 학습한 최소·최대값  
    scikit-learn[StandardScaler](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.StandardScaler.html) — 평균·표준편차를 이용하는 표준화와 ddof=0  
    scikit-learn[RobustScaler](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.RobustScaler.html) — 중앙값·IQR을 사용하는 대안  
    scikit-learn[전처리 가이드](https://scikit-learn.org/stable/modules/preprocessing.html) — Scaling, 행 단위 Normalization, 범주 인코딩  
    scikit-learn[Feature Scaling의 영향](https://scikit-learn.org/stable/auto_examples/preprocessing/plot_scaling_importance.html) — KNN과 PCA 등에 Scaling이 미치는 영향  
    scikit-learn[Scaler 비교](https://scikit-learn.org/stable/auto_examples/preprocessing/plot_all_scaling.html) — 이상치가 있는 데이터에서 각 방법의 차이
-   **pandas 출력**: pandas[concat](https://pandas.pydata.org/docs/reference/api/pandas.concat.html) — axis와 인덱스 정렬  
    scikit-learn[set\_output](https://scikit-learn.org/stable/auto_examples/miscellaneous/plot_set_output.html) — 변환 결과를 DataFrame으로 받는 설정  
    NumPy[assert\_allclose](https://numpy.org/doc/stable/reference/generated/numpy.testing.assert_allclose.html) — 허용 오차를 두고 소수점 결과를 검증하는 방법  
    pandas[DataFrame.std](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.std.html) — 표준편차의 ddof 기본값과 변경 방법  
    pandas[DataFrame.to\_csv](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.to_csv.html) — index와 encoding 옵션
-   **Encoding**: scikit-learn[LabelEncoder](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.LabelEncoder.html) — Target 라벨과 정수 코드의 대응  
    scikit-learn[OrdinalEncoder](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.OrdinalEncoder.html) — 입력 범주의 순서를 지정하는 방법  
    pandas[get\_dummies](https://pandas.pydata.org/docs/reference/api/pandas.get_dummies.html) — bool 기본 dtype, dummy\_na, sparse, drop\_first  
    scikit-learn[OneHotEncoder](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.OneHotEncoder.html) — 새 범주, Sparse 출력, 드문 범주와 기준 열 처리
-   **전처리 구성**: scikit-learn[ColumnTransformer](https://scikit-learn.org/stable/modules/generated/sklearn.compose.ColumnTransformer.html) — 열마다 다른 변환과 remainder 옵션  
    scikit-learn[데이터 누수와 전처리 주의점](https://scikit-learn.org/stable/common_pitfalls.html) — 훈련 데이터에서만 전처리 기준을 학습하는 이유
-   **파일 경로**: Python[os.path](https://docs.python.org/3/library/os.path.html) — exists와 isfile, 경로와 권한의 영향  
    Python[pathlib](https://docs.python.org/3/library/pathlib.html) — Path 결합, 절대·상대 경로, 일반 파일 검사  
    Python[tempfile](https://docs.python.org/3/library/tempfile.html) — TemporaryDirectory로 임시 폴더를 관리하는 방법  
    pandas[Series.map](https://pandas.pydata.org/docs/reference/api/pandas.Series.map.html) — 각 값에 함수를 적용하는 방법
-   **인덱스 정렬**: [DataFrame.reindex](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.reindex.html) — 본문에서 사용한 함수와 옵션을 확인합니다.
