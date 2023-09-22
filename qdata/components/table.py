import json
from typing import Any


class Table(dict):
    """
    Helper class for creating and storing tables.

    A valid table is a dictionary where the keys are strings with the column names and the values are
     lists of equal lengths with the values for each column.

    :param kw: Key-value pairs where the key is the column name and the value is a list of values for that column.
        All columns should have the same number of elements in it, empty strings can be used to fill in empty values.
    """
    def __init__(self, **kw: Any):
        super().__init__(self, **kw)
        self.validate()

    def __eq__(self, other):
        if isinstance(other, self.__class__):
            return self.__dict__ == other.__dict__
        return False

    def validate(self):
        for key in self.keys():
            if not isinstance(key, str):
                raise TypeError(f"Key {key} is not a string")

        lengths = []
        for val in self.values():
            if not isinstance(val, list):
                raise TypeError(f"Value {val} is not a list")
            lengths.append(len(val))

        if len(set(lengths)) > 1:
            raise ValueError("All lists must be of the same length")

    def to_markdown(self):
        self.validate()

        # Create table header
        table = "| " + " | ".join(self.keys()) + " |\n"
        table += "| " + " | ".join(["---"] * len(self)) + " |\n"

        # Create table rows
        n_rows = len([x for x in self.values()][0])
        for i in range(n_rows):
            row = "| " + " | ".join([str(self[key][i]) for key in self.keys()]) + " |\n"
            table += row

        return table
