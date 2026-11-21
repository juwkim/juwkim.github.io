---
title: "[데이터 분석 유형별 실습 문제 07] 영상 프레임 샘플링과 시계열 분석"
date: 2026-10-09T19:13:15+09:00
category: "Computer Science"
subcategory: "데이터 분석"
tags: []
description: "29.97 FPS 영상에서 1초마다 관측하려면 어떤 프레임을 골라야 하며, 빈 프레임은 그래프에 어떻게 남겨야 할까요? 입력의 관측 단위·처리 규칙·결과 파일을 먼저 확인하고 직접 구현합니다. 풀이와 실행 결과는…"
tistoryId: 76
---
> **이번 글의 질문**
>
> 29.97 FPS 영상에서 1초마다 관측하려면 어떤 프레임을 골라야 하며, 빈 프레임은 그래프에 어떻게 남겨야 할까요?

> **핵심 요약**
>
> 입력의 관측 단위·처리 규칙·결과 파일을 먼저 확인하고 직접 구현합니다. 풀이와 실행 결과는 연결된 풀이편에서 확인합니다.

## 1. 어떤 문제를 풀까요?

Drive의 짧은 영상에는 YOLO를 적용합니다. 따로 구성한 29.97 FPS 도형 영상은 프레임·시간·개수 계산을 정확한 정답과 비교하는 용도입니다. 도형은 사람이 아니므로 YOLO의 객체 정답으로 사용하지 않습니다. 모델 결과와 시간 처리 알고리즘을 분리해 검증합니다.

예선 가이드의 범위로 구성한 연습문제입니다. 실제 예선 문제 원문이나 공식 채점 기준이 아닙니다. 이 유형의 연습용 배점은 100점입니다.

## 2. 입력 데이터와 관측 단위

| 입력 파일 | 구성 | 열·내용 |
| --- | --- | --- |
| videos/drone\_mission.mp4 | 실제 실습 영상 | YOLO 객체 탐지 |
| videos/moving\_shapes.mp4 | 구성한 300프레임 영상 | 색 사각형의 검증용 개수 |
| shape\_frame\_truth.csv | 300행 | `frame_number`, `time_seconds`, `object_count` |

## 3. 구현할 요구사항

-   FPS와 열기·읽기 성공 여부를 확인합니다. round(샘플 번호 × FPS × 1초)로 목표 프레임을 계산합니다.
-   실제 영상은 YOLOv5u로 전체 클래스 탐지, 도형 영상은 색상 Mask와 연결 요소 개수로 분석합니다.
-   정상적으로 분석한 모든 프레임을 남깁니다. 개수가 0인 프레임도 요약 표에 포함합니다.
-   샘플의 요청 시각·실제 프레임 번호·FPS 기준 경과 시각을 모두 남깁니다. 같은 2초 구간의 `mean`·`max`·`sample_count`를 계산합니다.
-   video\_sample\_counts.csv·video\_detections.csv·video\_windows.csv·video\_read\_status.csv와 시간 그래프를 저장합니다.

## 4. 제출 파일의 구조

CSV는 results 폴더, 그래프는 plots 폴더에 저장합니다. ID와 상태 열을 유지해 입력과 결과가 다시 연결되도록 합니다. 아래 열 목록은 풀이 결과의 파일 계약입니다.

| 결과 파일 | 행의 기준 | 전체 열 |
| --- | --- | --- |
| `video_detections.csv` | 요구사항의 관측 단위를 유지합니다. | `video`, `frame_number`, `time_seconds`, `detection_index`, `class_name`, `confidence`, `xmin`, `ymin`, `xmax`, `ymax` |
| `video_read_status.csv` | 요구사항의 관측 단위를 유지합니다. | `video`, `declared_frames`, `decoded_frames`, `status` |
| `video_sample_counts.csv` | 요구사항의 관측 단위를 유지합니다. | `video`, `sample_number`, `requested_seconds`, `frame_number`, `time_seconds`, `backend_position_ms`, `total_count`, `person_count`, `status` |
| `video_windows.csv` | 요구사항의 관측 단위를 유지합니다. | `elapsed_window`, `mean_count`, `max_count`, `sample_count`, `video` |

## 5. 연습용 채점 기준

| 평가할 내용 | 배점 |
| --- | --- |
| 시간·프레임 계산 | 25 |
| 객체·도형 처리 | 25 |
| 0건·읽기 상태·집계 | 30 |
| 정답 비교·그래프·출력 | 20 |

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

-   **문제 자료**: [문제 자료](https://drive.google.com/file/d/1WjA2x9HHh7rPQ0kd9xeyyfpzdm4r7cZc/view?usp=drivesdk "Google Drive에서 자료를 엽니다.") — 입력 데이터와 starter.ipynb로 직접 구현을 시작합니다.
-   **공통 자료**: [실습 공통 자료](https://drive.google.com/file/d/1-W9cVOlqQ4BUYRX3AGH3qbC9CsUQjf-g/view?usp=drivesdk "Google Drive에서 자료를 엽니다.") — 공유 모델과 유형별 실습에 필요한 공통 준비 자료입니다.
-   **예선 가이드**: [국방AI경진대회 예선가이드](https://drive.google.com/file/d/1YDxg9ngucdJR7y4zUaBuW5bEYhzh1EJl/view) — 제공된 가이드의 범위를 바탕으로 만든 연습문제입니다.
-   **실행 안내**: — 두 압축파일을 같은 작업 폴더에 풀면 예선\_유형별\_실습 아래에 유형 폴더와 공유 \_models 폴더가 놓입니다. 해당 유형 폴더의 starter.ipynb에서 시작합니다. 공통 준비는 최초 한 번만 압축을 풀면 됩니다.
-   **데이터 출처**: — 제공된 실제 실습 영상과 직접 만든 색 사각형 영상을 함께 사용했습니다. 도형 영상에는 프레임별 개수 정답이 있고 실제 영상에는 정답 Box가 없습니다. 두 결과의 검증 기준을 구분합니다.

### 연습문제

-   **풀이**: [유형 07 풀이](/cs/data-analysis/practice-07-video-frame-sampling-solution/) — 목표 시각마다 프레임을 계산하고 객체가 없는 프레임도 포함해 시간 구간별 개수를 요약합니다.

### 관련 공부노트

-   **공부노트 03**: [시계열 데이터 정렬 및 리샘플링](/cs/data-analysis/pandas-03-time-series-resampling/)
-   **공부노트 09**: [이미지 처리 및 객체 탐지](/cs/data-analysis/pandas-09-image-object-detection/)
-   **공부노트 10**: [이미지·영상 데이터 분석](/cs/data-analysis/pandas-10-image-video-analysis/)
-   **공부노트 13**: [데이터 분석의 흔한 착각과 실수](/cs/data-analysis/pandas-13-common-pitfalls/)

### 공식 문서

-   **사용한 도구**: [OpenCV VideoCapture](https://docs.opencv.org/4.x/dd/d43/tutorial_py_video_display.html) — 프레임 읽기와 FPS·시간 속성을 확인합니다.  
    [Ultralytics predict](https://docs.ultralytics.com/modes/predict/) — 영상 프레임과 Box 결과를 처리합니다.
