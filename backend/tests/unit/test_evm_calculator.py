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
