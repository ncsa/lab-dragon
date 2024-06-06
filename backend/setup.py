from setuptools import setup, find_packages

if __name__ == "__main__":
    setup(
        name='dragon_core',
        version='0.0.1',
        description='Backend package for Lab Dragon',
        url='https://github.com/ncsa/lab-dragon/tree/main/backend',
        author='Marcos Frenkel, Santiago Núñez-Corrales, Rob Kooper',
        author_email='marcosf2@illinois.edu',
        packages=find_packages(),
        zip_safe=False
    )