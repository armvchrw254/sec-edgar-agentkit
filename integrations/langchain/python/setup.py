"""Setup for sec-edgar-langchain package."""

from setuptools import setup, find_packages

setup(
    name="sec-edgar-langchain",
    version="0.1.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "langchain>=0.1.0",
        "langchain-core>=0.1.0",
        "pydantic>=2.0.0",
        "requests>=2.28.0",
        "python-dateutil>=2.8.0",
    ],
    python_requires=">=3.8",
)