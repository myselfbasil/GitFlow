from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="gitflow-cli",
    version="0.1.0",
    author="Basil Shaji",
    author_email="your.email@example.com",
    description="A simple and powerful GitHub CLI helper tool",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/basilshaji/gitflow",
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
