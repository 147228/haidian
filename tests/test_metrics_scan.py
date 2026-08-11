#!/usr/bin/env python3
"""Focused regression tests for the read-only metrics field scanner."""

from __future__ import annotations

import importlib.util
import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "contrib" / "tools-metrics-scan.py"
SPEC = importlib.util.spec_from_file_location("metrics_scan", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
metrics_scan = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(metrics_scan)

MISSING = object()


def metric_entry(*, unit=MISSING, value=1) -> dict:
    entry = {
        "status": "known",
        "value": value,
        "source_files": [],
        "formula": "",
        "confidence": "high",
    }
    if unit is not MISSING:
        entry["unit"] = unit
    return entry


def run_scan(metrics: dict) -> dict:
    with tempfile.TemporaryDirectory() as tmp:
        repo = Path(tmp) / "repo"
        package = repo / "submissions" / "test-author" / "test-package"
        package.mkdir(parents=True)
        (package / "metrics.json").write_text(
            json.dumps(
                {
                    "schema_version": "0.1.0",
                    "units": {"area": "sqm", "length": "m"},
                    "metrics": metrics,
                }
            ),
            encoding="utf-8",
        )
        out_dir = Path(tmp) / "out"
        metrics_scan.scan(
            repo,
            out_dir,
            "20260812",
            "test-sha",
            sha_verified=True,
        )
        return json.loads(
            (out_dir / "metrics-fullfield-20260812.summary.json").read_text(
                encoding="utf-8"
            )
        )


class MetricsScanTests(unittest.TestCase):
    def test_missing_and_invalid_units_are_separate(self) -> None:
        summary = run_scan(
            {
                "missing_unit": metric_entry(),
                "null_unit": metric_entry(unit=None),
                "empty_unit": metric_entry(unit=""),
                "invalid_unit": metric_entry(unit="km"),
            }
        )
        counts = summary["outlier_counts_only"]
        self.assertEqual(counts["unit_missing"], 3)
        self.assertEqual(counts["unit_not_in_enum"], 1)
        self.assertEqual(
            summary["distributions"]["unit"]["other_values"]["total_count"],
            4,
        )

    def test_ratio_and_far_exclusions_remain_distinct(self) -> None:
        summary = run_scan(
            {
                "green_percent": metric_entry(unit="pct", value=150),
                "green_ratio": metric_entry(unit="ratio", value=1.2),
                "floor_area_ratio": metric_entry(unit="ratio", value=13),
                "phasing_far_area_sqm": metric_entry(
                    unit="sqm", value=100000000
                ),
            }
        )
        counts = summary["outlier_counts_only"]
        self.assertEqual(counts["ratio_outside_0_1"], 1)
        self.assertEqual(counts["far_above_12"], 1)

    @unittest.skipUnless(shutil.which("git"), "git is required for SHA verification")
    def test_sha_mismatch_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp) / "repo"
            subprocess.run(
                ["git", "init", "-q", str(repo)],
                check=True,
                capture_output=True,
                text=True,
            )
            subprocess.run(
                ["git", "-C", str(repo), "config", "user.email", "test@example.com"],
                check=True,
            )
            subprocess.run(
                ["git", "-C", str(repo), "config", "user.name", "Metrics Test"],
                check=True,
            )
            (repo / "README.md").write_text("test\n", encoding="utf-8")
            subprocess.run(
                ["git", "-C", str(repo), "add", "README.md"],
                check=True,
            )
            subprocess.run(
                ["git", "-C", str(repo), "commit", "-q", "-m", "test"],
                check=True,
                capture_output=True,
                text=True,
            )
            actual = subprocess.check_output(
                ["git", "-C", str(repo), "rev-parse", "HEAD"],
                text=True,
            ).strip()

            ok, detail = metrics_scan.verify_snapshot_sha(repo, actual)
            self.assertTrue(ok)
            self.assertEqual(detail, actual)

            ok, detail = metrics_scan.verify_snapshot_sha(repo, "0" * 40)
            self.assertFalse(ok)
            self.assertIn(actual, detail)


if __name__ == "__main__":
    unittest.main()
