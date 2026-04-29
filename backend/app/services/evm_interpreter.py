from app.constants import (
    CPI_EFFICIENT_THRESHOLD, SPI_ON_SCHEDULE_THRESHOLD,
    CPI_UNDER_BUDGET, CPI_ON_BUDGET, CPI_OVER_BUDGET, CPI_NO_DATA,
    SPI_AHEAD, SPI_ON_SCHEDULE, SPI_BEHIND, SPI_NO_DATA,
)


def interpret_cpi(cpi: float | None) -> str:
    if cpi is None:
        return CPI_NO_DATA
    if cpi > CPI_EFFICIENT_THRESHOLD:
        return CPI_UNDER_BUDGET
    if cpi == CPI_EFFICIENT_THRESHOLD:
        return CPI_ON_BUDGET
    return CPI_OVER_BUDGET


def interpret_spi(spi: float | None) -> str:
    if spi is None:
        return SPI_NO_DATA
    if spi > SPI_ON_SCHEDULE_THRESHOLD:
        return SPI_AHEAD
    if spi == SPI_ON_SCHEDULE_THRESHOLD:
        return SPI_ON_SCHEDULE
    return SPI_BEHIND
