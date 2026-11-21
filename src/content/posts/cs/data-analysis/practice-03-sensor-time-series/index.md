---
title: "[데이터 분석 유형별 실습 문제 03] 센서 시계열 정리와 분류·예측"
date: 2026-10-09T19:06:08+09:00
category: "Computer Science"
subcategory: "데이터 분석"
tags: []
description: "센서 6개의 불규칙한 기록을 시간 단위로 묶고, 빈 구간을 남긴 채 다음 시간 평균 온도와 32°C 기준 초과 여부를 예측하는 연습문제입니다. 예측 시점과 시간 분할 요구사항을 정리했습니다."
tistoryId: 68
---
> **이번 글의 질문**
>
> 누락된 센서 구간을 남기면서 다음 시간의 온도와 기준 초과 여부를 어떻게 함께 예측할까요?

## 1. 어떤 문제를 풀까요?

센서 여섯 개의 5분 주기 기록을 96시간 수집한 상황입니다. 일부 기록과 연속한 시간 구간이 빠졌고 비정상 측정값도 있습니다. 각 한 시간이 끝난 시점에 다음 한 시간의 평균 온도를 예측합니다. 시간 구간과 예측 시점의 관계를 연습하도록 구성한 합성 데이터입니다. 다음 시간 평균이 32°C 이상이면 기준 초과로 분류하는 문제도 함께 풉니다. 32°C는 이 연습에서 정한 가상의 운영 기준입니다.

예선 가이드의 범위로 구성한 연습문제입니다. 실제 예선 문제 원문이나 공식 채점 기준이 아닙니다. 이 유형의 연습용 배점은 100점입니다.

## 2. 입력 데이터와 관측 단위

| 입력 파일 | 구성 | 열·내용 |
| --- | --- | --- |
| `sensor_logs.csv` | 센서 6개 × 96시간의 불규칙 기록 | `log_id`, `sensor_id`, `timestamp`, `temperature_c`, `energy_kwh` |
| `sensor_config.json` | 설정 1개 | 시간대, 기대 관측 수, 허용 온도 범위, 기간, Test 시작 |

### 입력의 처음 세 행을 살펴봅니다

| log_id | sensor_id | timestamp | temperature_c | energy_kwh |
| --- | --- | --- | --- | --- |
| S02_0812 | S02 | 2026-08-03T19:40:02+00:00 | 22.377 | 0.2207 |
| S03_0317 | S03 | 2026-08-02T02:25:20+00:00 | 30.685 | 0.5013 |
| S04_0837 | S04 | 2026-08-03T21:45:06+00:00 | 25.856 | 0.2597 |

입력 일부를 보여 준 표입니다. 전체 분포·중복·결측 상태는 첨부한 데이터를 직접 읽어 확인합니다.

## 3. 구현할 요구사항

- 시간은 UTC로 변환하고 센서별로 정렬합니다. `temperature_c`의 허용 범위는 설정 파일을 따릅니다.
- 시간 구간은 [시작, 다음 시작)으로 묶습니다. 기록이 없는 시간도 남기고 `obs_count=0`, 평균 온도와 에너지 합계는 결측값으로 둡니다.
- t구간 종료 시점에 t+1구간 평균 온도를 예측합니다. 현재 완료한 t구간의 평균·에너지는 Feature로 쓸 수 있습니다.
- Test는 설정한 마지막 24시간입니다. Train과 각 CV Fold 사이에 Target이 넘어가지 않도록 시간 간격을 둡니다.
- 가상 운영 기준 32°C의 초과 여부를 같은 시간 분할에서 분류합니다. 분류 지표·Dummy Baseline과 Confusion Matrix도 저장합니다.
- `hourly_sensor.csv`·`forecast_predictions.csv`·`forecast_metrics.csv`·`time_cv_scores.csv`·`sensor_classification_metrics.csv`·`excluded_intervals.csv`와 시간·혼동 행렬 그래프를 저장합니다.

## 4. 제출 파일의 구조

CSV는 `results` 폴더, 그래프는 `plots` 폴더에 저장합니다. ID와 상태 열을 유지해 입력과 결과가 다시 연결되도록 합니다. 아래 열 목록은 풀이 결과의 파일 계약입니다.

| 결과 파일 | 전체 열 |
| --- | --- |
| `excluded_intervals.csv` | `timestamp`, `temp_mean`, `obs_count`, `valid_temp_count`, `energy_sum`, `coverage`, `sensor_id`, `temp_lag1`, `temp_lag3`, `past_rolling3`, `next_hour_temp`, `hour_sin`, `hour_cos`, `forecast_issued_at`, `target_hour_start`, `target_hour_end`, `forecast_eligible`, `exclusion_reason`, `evaluation_period`, `status` |
| `forecast_metrics.csv` | `model`, `RMSE_C`, `MAE_C` |
| `forecast_predictions.csv` | `sensor_id`, `timestamp`, `forecast_issued_at`, `target_hour_start`, `target_hour_end`, `next_hour_temp`, `obs_count`, `coverage`, `prediction_for_hour`, `predicted_temp`, `baseline_temp`, `actual_threshold_exceeded`, `predicted_threshold_exceeded` |
| `hourly_sensor.csv` | `timestamp`, `temp_mean`, `obs_count`, `valid_temp_count`, `energy_sum`, `coverage`, `sensor_id`, `temp_lag1`, `temp_lag3`, `past_rolling3`, `next_hour_temp`, `hour_sin`, `hour_cos`, `forecast_issued_at`, `target_hour_start`, `target_hour_end`, `forecast_eligible`, `exclusion_reason`, `evaluation_period`, `status` |
| `sensor_classification_metrics.csv` | `model`, `macro_f1`, `balanced_accuracy` |
| `time_cv_scores.csv` | `model`, `CV_RMSE`, `settings` |

## 5. 연습용 채점 기준

| 평가할 내용 | 배점 |
| --- | --- |
| 센서별 구간·결측 처리 | 25 |
| Feature·Target·분할 시점 | 25 |
| 시간 CV·분류·회귀·Baseline | 30 |
| 예측·상태·출력 검증 | 20 |

## 6. 실습 준비와 점검

참고자료의 문제 자료와 공통 자료를 준비한 뒤, 데이터 폴더 구성을 확인합니다.

```python
from pathlib import Path

root = Path.cwd()
assert (root / "data").is_dir()
print("입력 폴더:", root / "data")
```

### 풀이를 열기 전에 남길 메모

- 한 행이 무엇을 나타내는지 적습니다.
- 기준표·시간·ID·Target 중 어떤 조건이 결과를 바꿀지 적습니다.
- 필수 결과 파일을 먼저 만들고, 추가 실험은 기본 결과를 저장한 뒤 진행합니다.

## 참고자료

### 실습 데이터와 노트북

- **문제 자료**: [문제 자료](/files/maicon-2026/practice/%EC%8B%A4%EC%8A%B5_03_%EB%AC%B8%EC%A0%9C%EC%9E%90%EB%A3%8C.zip) — 입력 데이터와 `starter.ipynb`로 직접 구현을 시작합니다.
- **공통 자료**: [실습 공통 자료](/files/maicon-2026/practice/%EC%8B%A4%EC%8A%B5_%EA%B3%B5%ED%86%B5%EC%A4%80%EB%B9%84.zip) — 공유 모델과 유형별 실습에 필요한 공통 준비 자료입니다.
- **예선 가이드**: [국방AI경진대회 예선가이드](/files/maicon-2026/%EA%B5%AD%EB%B0%A9AI%EA%B2%BD%EC%A7%84%EB%8C%80%ED%9A%8C%20%EC%98%88%EC%84%A0%EA%B0%80%EC%9D%B4%EB%93%9C.pdf) — 제공된 가이드의 범위를 바탕으로 만든 연습문제입니다.
- **실행 안내**: 두 압축파일을 같은 작업 폴더에 풀면 `예선_유형별_실습` 아래에 유형 폴더와 공유 `_models` 폴더가 놓입니다. 해당 유형 폴더의 `starter.ipynb`에서 시작합니다. 공통 준비는 최초 한 번만 압축을 풀면 됩니다.
- **데이터 출처**: 센서 로그는 이 실습을 위해 만든 합성 데이터입니다. 32°C는 가상의 운영 기준이며 실제 장비의 경보 기준을 뜻하지 않습니다.

### 연습문제

- **풀이**: [유형 03 풀이](/cs/data-analysis/practice-03-sensor-time-series-solution/) — 센서별 시간 격자와 관측 수를 만들고 시간 순서대로 나눠 다음 시간 온도와 기준 초과를 예측합니다.

### 관련 공부노트

- **공부노트 03**: [시계열 데이터 정렬 및 리샘플링](/cs/data-analysis/pandas-03-time-series-resampling/)
- **공부노트 07**: [지도 학습 및 평가](/cs/data-analysis/pandas-07-supervised-learning/)
- **공부노트 13**: [데이터 분석의 흔한 착각과 실수](/cs/data-analysis/pandas-13-common-pitfalls/)

### 공식 문서

- **사용한 도구**: [DataFrame.resample](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.resample.html) — 그룹별 시간 구간과 closed·label을 확인합니다.  
  [TimeSeriesSplit](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html) — 과거에서 이후 시점으로 검증하고 gap을 둡니다.  
  [모델 평가 지표](https://scikit-learn.org/stable/modules/model_evaluation.html) — 같은 시계열 Test에서 분류·회귀의 지표를 각각 읽습니다.
