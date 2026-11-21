---
title: "[데이터 분석 유형별 실습 문제 02] 정형 데이터 분류와 회귀"
date: 2026-10-09T19:04:11+09:00
category: "Computer Science"
subcategory: "데이터 분석"
tags: []
description: "같은 장비의 반복 기록이 있을 때, 새로운 장비의 고장 여부와 정비 시간을 어떻게 평가할까요? 입력의 관측 단위·처리 규칙·결과 파일을 먼저 확인하고 직접 구현합니다. 풀이와 실행 결과는 연결된 풀이편에서…"
tistoryId: 66
---
> **이번 글의 질문**
>
> 같은 장비의 반복 기록이 있을 때, 새로운 장비의 고장 여부와 정비 시간을 어떻게 평가할까요?

> **핵심 요약**
>
> 입력의 관측 단위·처리 규칙·결과 파일을 먼저 확인하고 직접 구현합니다. 풀이와 실행 결과는 연결된 풀이편에서 확인합니다.

## 1. 어떤 문제를 풀까요?

장비 90개의 관측 기록 720행입니다. 다음 주 고장 여부는 분류, 정비 시간은 회귀로 예측합니다. 관측 시점의 Feature와 점검이 끝난 뒤 만들어진 `post_inspection_code`가 함께 있어 입력의 시점을 구분해야 합니다. 값은 반복 관측과 누수 방지를 연습하도록 구성한 합성 데이터입니다.

예선 가이드의 범위로 구성한 연습문제입니다. 실제 예선 문제 원문이나 공식 채점 기준이 아닙니다. 이 유형의 연습용 배점은 100점입니다.

## 2. 입력 데이터와 관측 단위

| 입력 파일 | 구성 | 열·내용 |
| --- | --- | --- |
| asset\_records.csv | 720행 / 장비 90개 | `record_id`, `asset_id`, 수치형 Feature 4개, `manufacturer`, `device_type`, Target 2개, `post_inspection_code` |
| splits.csv | 720행 | `record_id`, `split` |

### 입력의 처음 세 행을 살펴봅니다

| record\_id | asset\_id | vibration | temperature | hours\_since\_service |
| --- | --- | --- | --- | --- |
| R000\_00 | A000 | 1.0007636370446555 | 44.35614269516709 | 319.87409985926024 |
| R000\_01 | A000 | 2.2718231469213106 | 결측 | 300.05868014252087 |
| R000\_02 | A000 | 4.3531584603614695 | 66.44245560889341 | 383.2521343916752 |

입력 일부를 보여 준 표입니다. 전체 분포·중복·결측 상태는 첨부한 데이터를 직접 읽어 확인합니다.

## 3. 구현할 요구사항

-   splits.csv를 그대로 사용하고 Train/Test의 `asset_id` 교집합이 비어 있는지 확인합니다.
-   `record_id`·`asset_id`·두 Target·`post_inspection_code`는 Feature에서 제외합니다. 마지막 필드는 예측 시점에 제공되지 않습니다.
-   Train 그룹 CV에서 Logistic Regression의 C와 Random Forest의 max\_depth를 선택합니다. 전처리도 Fold 안에서 학습합니다.
-   분류는 macro F1·Balanced Accuracy·Confusion Matrix, 회귀는 RMSE·MAE·R²와 각각의 Dummy Baseline을 보고합니다.
-   asset\_test\_predictions.csv에는 같은 Test `record_id`의 실제·예측 Target 두 개를 저장합니다.

## 4. 제출 파일의 구조

CSV는 results 폴더, 그래프는 plots 폴더에 저장합니다. ID와 상태 열을 유지해 입력과 결과가 다시 연결되도록 합니다. 아래 열 목록은 풀이 결과의 파일 계약입니다.

| 결과 파일 | 행의 기준 | 전체 열 |
| --- | --- | --- |
| `asset_metrics.csv` | 요구사항의 관측 단위를 유지합니다. | `model`, `macro_f1`, `balanced_accuracy`, `RMSE_minutes`, `MAE_minutes`, `R2` |
| `asset_test_predictions.csv` | 요구사항의 관측 단위를 유지합니다. | `record_id`, `asset_id`, `failure_next_week`, `maintenance_minutes`, `predicted_failure`, `predicted_minutes`, `absolute_error_minutes` |

## 5. 연습용 채점 기준

| 평가할 내용 | 배점 |
| --- | --- |
| 분할과 누수 방지 | 30 |
| 전처리와 CV | 25 |
| 두 Target 평가·Baseline | 25 |
| 결과 연결·시각화 | 20 |

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

-   **문제 자료**: [문제 자료](https://drive.google.com/file/d/1WdBOQc3Qi60dKTRZq_araJzZvS3XBz6K/view?usp=drivesdk "Google Drive에서 자료를 엽니다.") — 입력 데이터와 starter.ipynb로 직접 구현을 시작합니다.
-   **공통 자료**: [실습 공통 자료](https://drive.google.com/file/d/1-W9cVOlqQ4BUYRX3AGH3qbC9CsUQjf-g/view?usp=drivesdk "Google Drive에서 자료를 엽니다.") — 공유 모델과 유형별 실습에 필요한 공통 준비 자료입니다.
-   **예선 가이드**: [국방AI경진대회 예선가이드](https://drive.google.com/file/d/1YDxg9ngucdJR7y4zUaBuW5bEYhzh1EJl/view) — 제공된 가이드의 범위를 바탕으로 만든 연습문제입니다.
-   **실행 안내**: — 두 압축파일을 같은 작업 폴더에 풀면 예선\_유형별\_실습 아래에 유형 폴더와 공유 \_models 폴더가 놓입니다. 해당 유형 폴더의 starter.ipynb에서 시작합니다. 공통 준비는 최초 한 번만 압축을 풀면 됩니다.
-   **데이터 출처**: — 장비 90개의 720행은 반복 관측과 누수 방지를 연습하도록 만든 합성 데이터입니다. 실제 고장 예측 성능을 입증하는 자료로 사용하지 않습니다.

### 연습문제

-   **풀이**: [유형 02 풀이](/cs/data-analysis/practice-02-tabular-modeling-solution/) — 장비별로 데이터를 나누고 전처리 Pipeline과 그룹 CV로 고장 분류·정비 시간 회귀 모델을 평가합니다.

### 관련 공부노트

-   **공부노트 02**: [정규화와 인코딩](/cs/data-analysis/pandas-02-normalization-encoding/)
-   **공부노트 07**: [지도 학습 및 평가](/cs/data-analysis/pandas-07-supervised-learning/)
-   **공부노트 11**: [종합 문제 풀이 (1)](/cs/data-analysis/pandas-11-comprehensive-problems-1/)
-   **공부노트 12**: [종합 문제 풀이 (2)](/cs/data-analysis/pandas-12-comprehensive-problems-2/)

### 공식 문서

-   **사용한 도구**: [ColumnTransformer와 Pipeline](https://scikit-learn.org/stable/modules/compose.html) — 수치형·범주형 전처리를 Fold 안에서 학습합니다.  
    [GroupKFold](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupKFold.html) — 같은 장비를 같은 Fold에 둡니다.
