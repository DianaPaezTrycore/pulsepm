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


def calculate_eac(bac: float, cpi: float | None) -> float | None:
    """EAC = BAC / CPI. Retorna None si CPI es None o 0"""
    if not cpi:
        return None
    return bac / cpi


def calculate_vac(bac: float, eac: float | None) -> float | None:
    """VAC = BAC - EAC. Retorna None si EAC es None"""
    if eac is None:
        return None
    return bac - eac


def calculate_activity_indicators(activity: dict) -> dict:
    bac = float(activity["bac"])
    planned = float(activity["planned_progress"])
    actual = float(activity["actual_progress"])
    ac = float(activity["actual_cost"])

    pv = calculate_planned_value(bac, planned)
    ev = calculate_earned_value(bac, actual)
    cpi = calculate_cpi(ev, ac)
    eac = calculate_eac(bac, cpi)

    return {
        "pv": pv,
        "ev": ev,
        "cv": calculate_cost_variance(ev, ac),
        "sv": calculate_schedule_variance(ev, pv),
        "cpi": cpi,
        "spi": calculate_spi(ev, pv),
        "eac": eac,
        "vac": calculate_vac(bac, eac),
    }


def calculate_project_indicators(activities: list[dict]) -> dict:
    if not activities:
        return {
            "pv": 0.0, "ev": 0.0, "cv": 0.0, "sv": 0.0,
            "cpi": None, "spi": None, "eac": None, "vac": None,
        }

    total_bac = sum(float(a["bac"]) for a in activities)
    total_pv = sum(
        calculate_planned_value(float(a["bac"]), float(a["planned_progress"]))
        for a in activities
    )
    total_ev = sum(
        calculate_earned_value(float(a["bac"]), float(a["actual_progress"]))
        for a in activities
    )
    total_ac = sum(float(a["actual_cost"]) for a in activities)

    cpi = calculate_cpi(total_ev, total_ac)
    eac = calculate_eac(total_bac, cpi)

    return {
        "pv": total_pv,
        "ev": total_ev,
        "cv": calculate_cost_variance(total_ev, total_ac),
        "sv": calculate_schedule_variance(total_ev, total_pv),
        "cpi": cpi,
        "spi": calculate_spi(total_ev, total_pv),
        "eac": eac,
        "vac": calculate_vac(total_bac, eac),
    }
