import pytest

from app.constants import (
    CPI_UNDER_BUDGET, CPI_ON_BUDGET, CPI_OVER_BUDGET, CPI_NO_DATA,
    SPI_AHEAD, SPI_ON_SCHEDULE, SPI_BEHIND, SPI_NO_DATA,
)
from app.services.evm_interpreter import interpret_cpi, interpret_spi


@pytest.mark.parametrize("cpi,expected", [
    (None, CPI_NO_DATA),
    (1.5, CPI_UNDER_BUDGET),
    (1.0, CPI_ON_BUDGET),
    (0.5, CPI_OVER_BUDGET),
])
def test_interpret_cpi(cpi, expected):
    assert interpret_cpi(cpi) == expected


@pytest.mark.parametrize("spi,expected", [
    (None, SPI_NO_DATA),
    (1.5, SPI_AHEAD),
    (1.0, SPI_ON_SCHEDULE),
    (0.5, SPI_BEHIND),
])
def test_interpret_spi(spi, expected):
    assert interpret_spi(spi) == expected
