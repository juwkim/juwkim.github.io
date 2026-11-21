---
title: "[데이터 분석 유형별 실습 문제 01] 정형 데이터 전처리와 집계"
date: 2026-10-09T18:09:02+09:00
category: "Computer Science"
subcategory: "데이터 분석"
tags: []
description: "CSV와 JSON에 나뉜 보급 기록에서 재전송된 거래와 piece·box 단위를 정리해 팀별·일별 보급량을 계산하는 연습문제입니다. 입력 구조, 요구사항, 제출 파일, 연습용 채점 기준을 정리했습니다."
tistoryId: 64
---
> **이번 글의 질문**
>
> 중복 거래와 단위가 다른 수량을 정리한 뒤, 팀별·일별 보급량을 어떻게 믿을 수 있게 계산할까요?

> **핵심 요약**
>
> 입력의 관측 단위·처리 규칙·결과 파일을 먼저 확인하고 직접 구현합니다. 풀이와 실행 결과는 연결된 풀이편에서 확인합니다.

## 1. 어떤 문제를 풀까요?

보급 기록이 CSV와 JSON에 나뉘어 있습니다. 같은 `event_id`가 재전송됐고, 수량은 `piece`·`box`가 섞여 있습니다. 최신 수정본을 채택하고 등록 팀에 연결되는 유효한 기록으로 일별 수량을 계산합니다. 데이터는 이 문제의 오류 처리와 집계를 연습하기 위해 구성했습니다.

예선 가이드의 범위로 구성한 연습문제입니다. 실제 예선 문제 원문이나 공식 채점 기준이 아닙니다. 이 유형의 연습용 배점은 100점입니다.

## 2. 입력 데이터와 관측 단위

| 입력 파일 | 구성 | 열·내용 |
| --- | --- | --- |
| `logistics_raw.csv` | 184행 | `event_id`, `unit_id`, `timestamp`, `item_id`, `quantity`, `quantity_unit`, `updated_at` |
| `unit_registry.json` | 7개 객체 | `unit_id`, `profile.name`, `profile.region`, `updated_at` |
| `item_catalog.csv` | 3행 | `item_id`, `pieces_per_box` |

### 입력의 처음 세 행을 살펴봅니다

| event_id | unit_id | timestamp | item_id | quantity |
| --- | --- | --- | --- | --- |
| E0000 | U001 | 2026-08-01T00:00:00+00:00 | water | 8 |
| E0001 | U002 | 2026-08-01T01:00:00+00:00 | battery | 2 |
| E0002 | U003 | 2026-08-01T02:00:00+00:00 | medical | 1 |

입력 일부를 보여 준 표입니다. 전체 분포·중복·결측 상태는 첨부한 데이터를 직접 읽어 확인합니다.

## 3. 구현할 요구사항

- `event_id`·`unit_id`는 같은 키의 `updated_at`이 가장 늦은 행을 선택합니다. 동일 시각의 충돌은 이 데이터에 없습니다.
- `quantity`는 0 이상이고 `piece`로 바꾼 값은 정수여야 합니다. `box`는 품목별 `pieces_per_box`를 곱합니다.
- 누락된 키, 미등록 키, 잘못된 날짜·수량·단위는 이유를 표시하고 집계에서 제외합니다. 값은 임의 대체하지 않습니다.
- `clean_records.csv`·`rejected_records.csv`·`daily_unit_summary.csv`·`unit_totals.csv`·`quality_report.csv`를 저장합니다. 등록만 있고 유효 기록이 없는 팀의 총량은 결측값으로 남깁니다.

## 4. 제출 파일의 구조

CSV는 `results` 폴더, 그래프는 `plots` 폴더에 저장합니다. ID와 상태 열을 유지해 입력과 결과가 다시 연결되도록 합니다. 아래 열 목록은 풀이 결과의 파일 계약입니다.

| 결과 파일 | 행의 기준 | 전체 열 |
| --- | --- | --- |
| `clean_records.csv` | 요구사항의 관측 단위를 유지합니다. | `event_id`, `unit_id`, `timestamp`, `item_id`, `quantity`, `quantity_unit`, `updated_at`, `unit_name`, `region`, `unit_match`, `pieces_per_box`, `quantity_numeric`, `quantity_piece`, `reject_reason` |
| `daily_unit_summary.csv` | 요구사항의 관측 단위를 유지합니다. | `day`, `unit_id`, `unit_name`, `quantity_piece`, `valid_records` |
| `quality_report.csv` | 요구사항의 관측 단위를 유지합니다. | `check`, `value` |
| `rejected_records.csv` | 요구사항의 관측 단위를 유지합니다. | `event_id`, `unit_id`, `timestamp`, `item_id`, `quantity`, `quantity_unit`, `updated_at`, `unit_name`, `region`, `unit_match`, `pieces_per_box`, `quantity_numeric`, `quantity_piece`, `reject_reason` |
| `unit_totals.csv` | 요구사항의 관측 단위를 유지합니다. | `unit_id`, `unit_name`, `quantity_piece`, `valid_records` |

## 5. 연습용 채점 기준

| 평가할 내용 | 배점 |
| --- | --- |
| 키·버전 처리 | 20 |
| 단위·오류 처리 | 30 |
| 행 수와 집계 검증 | 30 |
| 출력 파일·시각화 | 20 |

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

- **문제 자료**: [문제 자료](/files/maicon-2026/practice/%EC%8B%A4%EC%8A%B5_01_%EB%AC%B8%EC%A0%9C%EC%9E%90%EB%A3%8C.zip "Google Drive에서 자료를 엽니다.") — 입력 데이터와 `starter.ipynb`로 직접 구현을 시작합니다.
- **공통 자료**: [실습 공통 자료](/files/maicon-2026/practice/%EC%8B%A4%EC%8A%B5_%EA%B3%B5%ED%86%B5%EC%A4%80%EB%B9%84.zip "Google Drive에서 자료를 엽니다.") — 공유 모델과 유형별 실습에 필요한 공통 준비 자료입니다.
- **예선 가이드**: [국방AI경진대회 예선가이드](/files/maicon-2026/%EA%B5%AD%EB%B0%A9AI%EA%B2%BD%EC%A7%84%EB%8C%80%ED%9A%8C%20%EC%98%88%EC%84%A0%EA%B0%80%EC%9D%B4%EB%93%9C.pdf) — 제공된 가이드의 범위를 바탕으로 만든 연습문제입니다.
- **실행 안내**: 두 압축파일을 같은 작업 폴더에 풀면 `예선_유형별_실습` 아래에 유형 폴더와 공유 `_models` 폴더가 놓입니다. 해당 유형 폴더의 `starter.ipynb`에서 시작합니다. 공통 준비는 최초 한 번만 압축을 풀면 됩니다.
- **데이터 출처**: 거래·팀·품목 데이터는 이 실습을 위해 Seed 2026으로 구성한 합성 데이터입니다. 실제 부대의 보급 기록이 아닙니다.

### 연습문제

- **풀이**: [유형 01 풀이](/cs/data-analysis/practice-01-tabular-preprocessing-solution/) — 최신 거래를 선택하고 수량 단위를 맞춘 뒤, 오류 기록을 분리해 팀별·일별로 집계합니다.

### 관련 공부노트

- **공부노트 01**: [결측치와 이상치 처리](/cs/data-analysis/pandas-01-missing-values-outliers/)
- **공부노트 03**: [시계열 데이터 정렬 및 리샘플링](/cs/data-analysis/pandas-03-time-series-resampling/)
- **공부노트 04**: [데이터 통계량](/cs/data-analysis/pandas-04-descriptive-statistics/)
- **공부노트 06**: [데이터 해석](/cs/data-analysis/pandas-06-data-interpretation/)

### 공식 문서

- **사용한 도구**: [pandas.merge](https://pandas.pydata.org/docs/reference/api/pandas.merge.html) — validate·indicator와 null key의 매칭을 확인합니다.  
  [json_normalize](https://pandas.pydata.org/docs/reference/api/pandas.json_normalize.html) — 중첩 JSON을 열로 펼치는 방법입니다.
