def calculate_planned_value(bac: float, planned_progress: float) -> float:
    """PV = (% planificado / 100) × BAC"""
    return (planned_progress / 100) * bac


def calculate_earned_value(bac: float, actual_progress: float) -> float:
    """EV = (% completado / 100) × BAC"""
    return (actual_progress / 100) * bac


def calculate_cost_variance(ev: float, ac: float) -> float:
    """CV = EV - AC"""
    return ev - ac


def calculate_schedule_variance(ev: float, pv: float) -> float:
    """SV = EV - PV"""
    return ev - pv


def calculate_cpi(ev: float, ac: float) -> float | None:
    """CPI = EV / AC. Retorna None si AC == 0"""
    if ac == 0:
        return None
    return ev / ac


def calculate_spi(ev: float, pv: float) -> float | None:
    """SPI = EV / PV. Retorna None si PV == 0"""
    if pv == 0:
        return None
    return ev / pv
