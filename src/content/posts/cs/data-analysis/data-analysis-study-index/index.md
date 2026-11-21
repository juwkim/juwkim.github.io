---
title: "[데이터 분석 학습 기록] 공부노트·유형별 실습·모의 실습 전체 목차"
date: 2026-10-09T19:31:50+09:00
category: "Computer Science"
subcategory: "데이터 분석"
tags: []
description: "데이터 분석 학습 기록 전체 목차입니다. 공부노트 13편, 유형별 문제·풀이 16편, 90분 모의 실습 3편을 읽는 순서와 함께 연결하고, 실습 자료를 쓰는 방법과 결과를 읽는 기준을 정리합니다."
tistoryId: 83
---
> **이번 글의 질문**
>
> 공부한 개념을 직접 푸는 문제와 연결해 다시 찾아볼 수 있을까요?

> **핵심 요약**
>
> 공부노트 13편, 유형별 문제·풀이 16편, 90분 모의 실습 3편을 한 목차에서 연결합니다. 예제·데이터·실행 결과는 각 글에서 함께 확인합니다.

## 1. 이 학습 기록을 읽는 순서

공부노트에서 개념과 작은 예제를 확인하고, 유형별 문제를 직접 구현한 다음 풀이의 코드·출력·해석과 비교합니다. 마지막에는 세 유형을 묶은 90분 모의 실습으로 입력부터 저장까지 반복합니다.

| 묶음 | 글 수 | 읽는 목적 |
| --- | --- | --- |
| 전체 목차 | 1 | 학습 경로·자료·관련 글 찾기 |
| 공부노트 | 13 | 개념·문법·작은 실험·흔한 착각 |
| 유형별 실습 | 16 | 8개 유형의 문제편·풀이편 |
| 모의 실습 | 3 | 90분 풀이·파일 점검·복기 |

## 2. 데이터·코드·결과를 함께 사용합니다

| 자료 | 사용 방법 |
| --- | --- |
| 문제자료 ZIP | 입력·문제·starter.ipynb를 같은 작업 폴더에 풉니다. |
| 풀이와 결과 ZIP | 기본 풀이·추가 비교 Notebook·결과 CSV·그림을 확인합니다. |
| 공통준비 ZIP | 의존성·공유 가중치·검사 도구를 최초 한 번 준비합니다. |
| 공부노트 예제 ZIP | 01\~13의 작은 비교 코드를 개념과 함께 읽습니다. |

압축 파일은 같은 폴더에 풀어 사용합니다. 예선\_유형별\_실습 아래의 각 유형 폴더에서 Notebook을 열고, 현재 폴더에 data가 있는지 확인합니다. Python 스크립트도 해당 유형 폴더에서 실행합니다.

```bash
# 예선_유형별_실습 폴더에서 필요한 의존성을 설치합니다.
python -m pip install -r requirements.txt
python -m pip install -r requirements-media.txt
# OCR은 Tesseract 실행 파일과 eng 언어 데이터가 별도로 필요합니다.
tesseract --version
tesseract --list-langs
```

## 3. 예제와 평가 결과를 읽는 기준

- 합성 데이터·실제 사진·제공된 영상의 출처를 각 실습 글에서 구분합니다.
- 기본 풀이의 실제 실행 결과, 작은 설명용 예제, 아직 수행하지 않은 확장 문제를 구분합니다.
- 새 장비·새 양식·미래 시간 등 평가하려는 입력의 의미에 맞춰 데이터를 나눕니다.
- 모델 점수와 함께 Baseline·오류 사례·결과 파일의 상태를 확인합니다.

공부노트 01\~12의 원래 실습 데이터는 해당 글의 Drive 참고자료에서 확인합니다. 이 묶음은 새로 만든 유형별 실습의 입력과 풀이, 공부노트의 심화 비교 예제를 함께 제공합니다.

## 참고자료

### 실습 데이터와 노트북

- **심화 예제**: [심화 예제 자료](/files/maicon-2026/practice/%EA%B3%B5%EB%B6%80%EB%85%B8%ED%8A%B8_%EC%8B%AC%ED%99%94_%EC%98%88%EC%A0%9C.zip "Google Drive에서 자료를 엽니다.") — 공부노트 01\~13의 개념을 비교하는 작은 예제 코드를 확인합니다.
- **공통 자료**: [실습 공통 자료](/files/maicon-2026/practice/%EC%8B%A4%EC%8A%B5_%EA%B3%B5%ED%86%B5%EC%A4%80%EB%B9%84.zip "Google Drive에서 자료를 엽니다.") — 의존성·공유 가중치·검사 도구를 최초 한 번 준비합니다.

### 공부노트 01\~13

- **공부노트 01**: [결측치와 이상치 처리](/cs/data-analysis/pandas-01-missing-values-outliers/) — 연결 유형: 유형 01.
- **공부노트 02**: [정규화와 인코딩](/cs/data-analysis/pandas-02-normalization-encoding/) — 연결 유형: 유형 02.
- **공부노트 03**: [시계열 데이터 정렬 및 리샘플링](/cs/data-analysis/pandas-03-time-series-resampling/) — 연결 유형: 유형 01, 유형 03, 유형 07.
- **공부노트 04**: [데이터 통계량](/cs/data-analysis/pandas-04-descriptive-statistics/) — 연결 유형: 유형 01.
- **공부노트 05**: [데이터 시각화](/cs/data-analysis/pandas-05-data-visualization/) — 입력 점검·시각화·결과 해석 전반에 활용합니다.
- **공부노트 06**: [데이터 해석](/cs/data-analysis/pandas-06-data-interpretation/) — 연결 유형: 유형 01.
- **공부노트 07**: [지도 학습 및 평가](/cs/data-analysis/pandas-07-supervised-learning/) — 연결 유형: 유형 02, 유형 03, 유형 04, 유형 05.
- **공부노트 08**: [비지도 학습](/cs/data-analysis/pandas-08-unsupervised-learning/) — 입력 점검·시각화·결과 해석 전반에 활용합니다.
- **공부노트 09**: [이미지 처리 및 객체 탐지](/cs/data-analysis/pandas-09-image-object-detection/) — 연결 유형: 유형 05, 유형 06, 유형 07.
- **공부노트 10**: [이미지·영상 데이터 분석](/cs/data-analysis/pandas-10-image-video-analysis/) — 연결 유형: 유형 04, 유형 06, 유형 07, 유형 08.
- **공부노트 11**: [종합 문제 풀이 (1)](/cs/data-analysis/pandas-11-comprehensive-problems-1/) — 연결 유형: 유형 02, 유형 06.
- **공부노트 12**: [종합 문제 풀이 (2)](/cs/data-analysis/pandas-12-comprehensive-problems-2/) — 연결 유형: 유형 02, 유형 06.
- **공부노트 13**: [데이터 분석의 흔한 착각과 실수](/cs/data-analysis/pandas-13-common-pitfalls/) — 연결 유형: 유형 03, 유형 04, 유형 05, 유형 07, 유형 08.

### 연습문제

문제편에는 요구사항과 입력 자료를, 풀이편에는 실제 코드·출력·그래프·처리 이유를 담았습니다. 풀이마다 두 비교 예제를 실행해 잘못된 처리의 영향을 확인합니다.

#### 유형 01: 정형 데이터 전처리와 집계

- **문제**: [유형 01 문제](/cs/data-analysis/practice-01-tabular-preprocessing/) — 중복 거래와 단위가 다른 수량을 정리한 뒤, 팀별·일별 보급량을 어떻게 믿을 수 있게 계산할까요?
- **풀이**: [유형 01 풀이](/cs/data-analysis/practice-01-tabular-preprocessing-solution/) — 최신 거래를 선택하고 수량 단위를 맞춘 뒤, 오류 기록을 분리해 팀별·일별로 집계합니다.

#### 유형 02: 정형 데이터 분류와 회귀

- **문제**: [유형 02 문제](/cs/data-analysis/practice-02-tabular-modeling/) — 같은 장비의 반복 기록이 있을 때, 새로운 장비의 고장 여부와 정비 시간을 어떻게 평가할까요?
- **풀이**: [유형 02 풀이](/cs/data-analysis/practice-02-tabular-modeling-solution/) — 장비별로 데이터를 나누고 전처리 Pipeline과 그룹 CV로 고장 분류·정비 시간 회귀 모델을 평가합니다.

#### 유형 03: 센서 시계열 정리와 분류·예측

- **문제**: [유형 03 문제](/cs/data-analysis/practice-03-sensor-time-series/) — 누락된 센서 구간을 남기면서 다음 시간의 온도와 기준 초과 여부를 어떻게 함께 예측할까요?
- **풀이**: [유형 03 풀이](/cs/data-analysis/practice-03-sensor-time-series-solution/) — 센서별 시간 격자와 관측 수를 만들고 시간 순서대로 나눠 다음 시간 온도와 기준 초과를 예측합니다.

#### 유형 04: 비정형 텍스트 분류

- **문제**: [유형 04 문제](/cs/data-analysis/practice-04-text-classification/) — 표현이 조금씩 다른 접수 문장을 분류하면서, 같은 양식의 문장이 Train과 Test에 섞이는 문제를 어떻게 막을까요?
- **풀이**: [유형 04 풀이](/cs/data-analysis/practice-04-text-classification-solution/) — 문장 양식별로 데이터를 나누고 TF-IDF와 Logistic Regression을 Pipeline으로 연결해 그룹 CV로 검증합니다.

#### 유형 05: 사진 분류와 Transfer Learning

- **문제**: [유형 05 문제](/cs/data-analysis/practice-05-image-transfer-learning/) — 사전 학습된 이미지 모델을 고정한 채, 사진이 개미인지 벌인지 분류하는 새 모델을 어떻게 만들까요?
- **풀이**: [유형 05 풀이](/cs/data-analysis/practice-05-image-transfer-learning-solution/) — 고정한 MobileNet에서 특징을 추출하고 Validation에서 분류기를 선택한 뒤 Test 사진을 평가합니다.

#### 유형 06: 사진 객체 탐지와 상태를 보존한 집계

- **문제**: [유형 06 문제](/cs/data-analysis/practice-06-object-detection/) — 정상 사진·빈 사진·누락 사진이 섞여 있을 때, 장면별 사람·차량 탐지 수를 어떻게 요약할까요?
- **풀이**: [유형 06 풀이](/cs/data-analysis/practice-06-object-detection-solution/) — YOLO 탐지 결과와 사진별 처리 상태를 저장하고, 탐지 0건과 처리 실패를 구분해 장면별로 집계합니다.

#### 유형 07: 영상 프레임 샘플링과 시계열 분석

- **문제**: [유형 07 문제](/cs/data-analysis/practice-07-video-frame-sampling/) — 29.97 FPS 영상에서 1초마다 관측하려면 어떤 프레임을 골라야 하며, 빈 프레임은 그래프에 어떻게 남겨야 할까요?
- **풀이**: [유형 07 풀이](/cs/data-analysis/practice-07-video-frame-sampling-solution/) — 목표 시각마다 프레임을 계산하고 객체가 없는 프레임도 포함해 시간 구간별 개수를 요약합니다.

#### 유형 08: OCR 문서에서 구조화 데이터 만들기

- **문제**: [유형 08 문제](/cs/data-analysis/practice-08-ocr-structured-data/) — 이미지에서 읽은 날짜·수량·가격을 표로 옮길 때, 구분 기호와 음수 부호를 어떻게 보존할까요?
- **풀이**: [유형 08 풀이](/cs/data-analysis/practice-08-ocr-structured-data-solution/) — OCR 원문과 좌표를 보관하고 항목별 값을 추출·검증한 뒤, 정답 표와 필드별 일치도를 비교합니다.

### 90분 모의 실습

- **모의 A**: [모의 A 문제와 복기](/cs/data-analysis/mock-exam-a-90-min-review/) — 정형 데이터 전처리와 집계 / 센서 시계열 정리와 분류·예측 / 비정형 텍스트 분류
- **모의 B**: [모의 B 문제와 복기](/cs/data-analysis/mock-exam-b-90-min-review/) — 정형 데이터 전처리와 집계 / 사진 객체 탐지와 상태를 보존한 집계 / 정형 데이터 분류와 회귀
- **모의 C**: [모의 C 문제와 복기](/cs/data-analysis/mock-exam-c-90-min-review/) — OCR 문서에서 구조화 데이터 만들기 / 영상 프레임 샘플링과 시계열 분석 / 사진 분류와 Transfer Learning

각 유형은 100점 기준의 독립 연습문제입니다. 모의 세트에서만 20·35·45점으로 환산했습니다. 실제 예선 문제를 재현한 자료가 아니며 OCR·도형 영상은 범위를 넓히는 심화 연습입니다.

### 학습 범위

- **예선 가이드**: [국방AI경진대회 예선가이드](/files/maicon-2026/%EA%B5%AD%EB%B0%A9AI%EA%B2%BD%EC%A7%84%EB%8C%80%ED%9A%8C%20%EC%98%88%EC%84%A0%EA%B0%80%EC%9D%B4%EB%93%9C.pdf) — 제공된 가이드의 범위와 배점을 참고했습니다.
