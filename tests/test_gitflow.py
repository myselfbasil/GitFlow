#!/usr/bin/env python

"""Tests for `gitflow` package."""

import unittest
from gitflow import cli


class TestGitFlow(unittest.TestCase):
    """Tests for `gitflow` package."""

    def setUp(self):
        """Set up test fixtures, if any."""
        pass

    def tearDown(self):
        """Tear down test fixtures, if any."""
        pass

    def test_cli_import(self):
        """Test CLI module imports correctly."""
        self.assertIsNotNone(cli.main)


if __name__ == '__main__':
    unittest.main()
