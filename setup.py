from setuptools import setup, find_packages
from gitflow import __version__

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="gitflow-cli",
    version=__version__,
    author="GitFlow Developer",
    author_email="example@example.com",
    description="A simple and powerful GitHub CLI helper tool",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/gitflow",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",
    install_requires=[
        "colorama",
        "inquirer",
    ],
    entry_points={
        "console_scripts": [
            "gitflow=gitflow.cli:main",
        ],
    },
)
