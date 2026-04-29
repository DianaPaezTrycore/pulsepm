import pytest

from app.services.evm_calculator import (
    calculate_planned_value,
    calculate_earned_value,
    calculate_cost_variance,
    calculate_schedule_variance,
    calculate_cpi,
    calculate_spi,
    calculate_eac,
    calculate_vac,
    calculate_activity_indicators,
    calculate_project_indicators,
)


def test_pv_normal_case():
    assert calculate_planned_value(10000, 60) == 6000


def test_ev_normal_case():
    assert calculate_earned_value(10000, 40) == 4000


def test_cv_positive_when_under_budget():
    assert calculate_cost_variance(ev=4000, ac=3000) == 1000


def test_cv_negative_when_over_budget():
    assert calculate_cost_variance(ev=4000, ac=7000) == -3000


def test_cpi_greater_than_one_when_efficient():
    assert calculate_cpi(ev=8000, ac=4000) == 2.0


def test_spi_less_than_one_when_delayed():
    assert calculate_spi(ev=4000, pv=6000) == pytest.approx(2 / 3)


def test_eac_calculation():
    assert calculate_eac(bac=10000, cpi=0.5) == 20000


def test_vac_calculation():
    assert calculate_vac(bac=10000, eac=12000) == -2000


def test_cpi_returns_none_when_ac_is_zero():
    assert calculate_cpi(ev=5000, ac=0) is None


def test_spi_returns_none_when_pv_is_zero():
    assert calculate_spi(ev=5000, pv=0) is None


def test_eac_returns_none_when_cpi_is_none():
    assert calculate_eac(bac=10000, cpi=None) is None


def test_project_indicators_with_empty_activities_list():
    result = calculate_project_indicators([])
    assert result["pv"] == 0.0
    assert result["ev"] == 0.0
    assert result["cv"] == 0.0
    assert result["sv"] == 0.0
    assert result["cpi"] is None
    assert result["spi"] is None
    assert result["eac"] is None
    assert result["vac"] is None


def test_project_indicators_with_zero_actual_progress():
    activity = {
        "bac": 10000.0,
        "planned_progress": 50.0,
        "actual_progress": 0.0,
        "actual_cost": 1000.0,
    }
    result = calculate_project_indicators([activity])
    assert result["ev"] == 0.0
    assert result["cpi"] == 0.0
    assert result["spi"] == 0.0
    assert result["eac"] is None
    assert result["vac"] is None


def test_activity_indicators_full_calculation(sample_activity):
    result = calculate_activity_indicators(sample_activity)
    assert result["pv"] == 6000.0
    assert result["ev"] == 4000.0
    assert result["cv"] == -3000.0
    assert result["sv"] == -2000.0
    assert result["cpi"] == pytest.approx(4000 / 7000)
    assert result["spi"] == pytest.approx(4000 / 6000)
    assert result["eac"] == pytest.approx(10000 * 7000 / 4000)
    assert result["vac"] == pytest.approx(10000 - (10000 * 7000 / 4000))


def test_project_consolidated_with_multiple_activities():
    activities = [
        {
            "bac": 10000, "planned_progress": 60,
            "actual_progress": 40, "actual_cost": 7000,
        },
        {
            "bac": 5000, "planned_progress": 100,
            "actual_progress": 100, "actual_cost": 4000,
        },
    ]
    result = calculate_project_indicators(activities)
    assert result["pv"] == 11000.0
    assert result["ev"] == 9000.0
    assert result["cv"] == -2000.0
    assert result["sv"] == -2000.0
    assert result["cpi"] == pytest.approx(9000 / 11000)
    assert result["spi"] == pytest.approx(9000 / 11000)
    assert result["eac"] == pytest.approx(15000 / (9000 / 11000))
