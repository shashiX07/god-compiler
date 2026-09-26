#!/usr/bin/env python3
"""God Compiler SQL playground.

Runs user SQL against an in-memory SQLite database that is preloaded with a
small but realistic store dataset. Each run starts fresh.
"""

from __future__ import annotations

import sqlite3
import sys
import time
from typing import Iterable

ROW_LIMIT = 200
COL_WIDTH_CAP = 42

HELP_TEXT = """\
SQL playground commands
  .help              this list
  .tables            list seeded tables
  .schema [table]    show CREATE statements
  .count             row counts for every table
  SHOW TABLES        same as .tables
  DESCRIBE table     column layout for a table

The database is SQLite. Each Run starts from the sample dataset below.
Writes (CREATE / INSERT / UPDATE / DELETE) work for this session only.

Sample tables
  departments   employees   customers
  products      orders      order_items
"""

SEED_SQL = """
PRAGMA foreign_keys = ON;

CREATE TABLE departments (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE
);

CREATE TABLE employees (
  id             INTEGER PRIMARY KEY,
  name           TEXT NOT NULL,
  department_id  INTEGER NOT NULL REFERENCES departments(id),
  title          TEXT NOT NULL,
  salary         INTEGER NOT NULL,
  hired_on       TEXT NOT NULL
);

CREATE TABLE customers (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  city     TEXT NOT NULL,
  country  TEXT NOT NULL
);

CREATE TABLE products (
  id        INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  category  TEXT NOT NULL,
  price     REAL NOT NULL,
  stock     INTEGER NOT NULL
);

CREATE TABLE orders (
  id           INTEGER PRIMARY KEY,
  customer_id  INTEGER NOT NULL REFERENCES customers(id),
  ordered_at   TEXT NOT NULL,
  status       TEXT NOT NULL
);

CREATE TABLE order_items (
  id          INTEGER PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders(id),
  product_id  INTEGER NOT NULL REFERENCES products(id),
  quantity    INTEGER NOT NULL,
  unit_price  REAL NOT NULL
);

INSERT INTO departments (id, name) VALUES
  (1, 'Engineering'),
  (2, 'Product'),
  (3, 'Design'),
  (4, 'Sales');

INSERT INTO employees (id, name, department_id, title, salary, hired_on) VALUES
  (1,  'Ada Lovelace',     1, 'Staff Engineer',     180000, '2018-03-12'),
  (2,  'Alan Turing',      1, 'Principal Engineer', 210000, '2016-07-01'),
  (3,  'Grace Hopper',     1, 'Engineering Manager', 195000, '2017-11-20'),
  (4,  'Linus Torvalds',   1, 'Senior Engineer',    170000, '2019-02-04'),
  (5,  'Margaret Hamilton',2, 'Product Lead',       165000, '2018-09-15'),
  (6,  'Katherine Johnson',2, 'Product Analyst',    128000, '2021-01-11'),
  (7,  'Don Norman',       3, 'Design Director',    155000, '2015-05-22'),
  (8,  'Susan Kare',       3, 'Senior Designer',    132000, '2020-06-08'),
  (9,  'Barbara Liskov',   2, 'PM',                 148000, '2019-10-30'),
  (10, 'James Gosling',    4, 'Account Executive',  118000, '2022-04-18'),
  (11, 'Guido van Rossum', 4, 'Sales Engineer',     140000, '2020-12-02'),
  (12, 'Ken Thompson',     1, 'SRE',                160000, '2014-08-19');

INSERT INTO customers (id, name, city, country) VALUES
  (1, 'Nova Labs',      'Bengaluru', 'India'),
  (2, 'Cedar & Co',     'London',    'United Kingdom'),
  (3, 'Helio Retail',   'Austin',    'United States'),
  (4, 'Pinnacle Books', 'Toronto',   'Canada'),
  (5, 'Orbit Foods',    'Berlin',    'Germany'),
  (6, 'Lumen Health',   'Singapore', 'Singapore'),
  (7, 'Northwind',      'Seattle',   'United States'),
  (8, 'Maple Studio',   'Montreal',  'Canada');

INSERT INTO products (id, name, category, price, stock) VALUES
  (1, 'Mechanical Keyboard', 'Hardware', 129.00, 40),
  (2, 'USB-C Hub',           'Hardware',  49.00, 80),
  (3, 'Noise-cancelling HP', 'Hardware', 199.00, 25),
  (4, 'Notebook Pro 14',     'Hardware', 1499.00, 12),
  (5, 'SQL Workbook',        'Books',     24.50, 200),
  (6, 'Systems Design Notes','Books',     32.00, 140),
  (7, 'Team Standup Mug',    'Merch',     14.00, 300),
  (8, 'Sticker Pack',        'Merch',      6.00, 500),
  (9, 'Cloud Credits 100',   'Services', 100.00, 999),
  (10,'Office Hours',        'Services',  75.00, 999);

INSERT INTO orders (id, customer_id, ordered_at, status) VALUES
  (1, 1, '2026-01-12', 'paid'),
  (2, 1, '2026-03-02', 'paid'),
  (3, 3, '2026-02-18', 'shipped'),
  (4, 4, '2026-04-09', 'paid'),
  (5, 5, '2026-05-21', 'cancelled'),
  (6, 6, '2026-06-14', 'paid'),
  (7, 7, '2026-07-03', 'shipped'),
  (8, 2, '2026-08-27', 'pending');

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
  (1,  1, 4, 2, 1499.00),
  (2,  1, 1, 2,  129.00),
  (3,  2, 5, 10,  24.50),
  (4,  2, 6, 4,   32.00),
  (5,  3, 3, 1,  199.00),
  (6,  3, 2, 3,   49.00),
  (7,  4, 5, 20,  24.50),
  (8,  5, 9, 5,  100.00),
  (9,  6, 4, 1, 1499.00),
  (10, 6, 7, 12,  14.00),
  (11, 7, 1, 6,  129.00),
  (12, 7, 8, 20,   6.00),
  (13, 8, 10, 2,  75.00),
  (14, 8, 6, 3,   32.00),
  (15, 4, 2, 2,   49.00);
"""

BLOCKED_PREFIXES = (
    "attach",
    "detach",
    "vacuum into",
)

BLOCKED_PRAGMAS = (
    "writable_schema",
    "temp_store_directory",
    "load_extension",
)


def cell(value) -> str:
    if value is None:
        return "NULL"
    text = str(value)
    text = text.replace("\n", "\\n")
    if len(text) > COL_WIDTH_CAP:
        return text[: COL_WIDTH_CAP - 1] + "…"
    return text


def widths(headers: list[str], rows: list[list[str]]) -> list[int]:
    sizes = [len(h) for h in headers]
    for row in rows:
        for i, value in enumerate(row):
            sizes[i] = max(sizes[i], len(value))
    return sizes


def rule(sizes: list[int], left: str, mid: str, right: str, fill: str = "─") -> str:
    return left + mid.join(fill * (size + 2) for size in sizes) + right


def format_table(headers: Iterable[str], raw_rows: Iterable[Iterable]) -> str:
    header_list = [str(h) for h in headers]
    rows = [[cell(v) for v in row] for row in raw_rows]
    if not header_list:
        return "(empty result)"
    sizes = widths(header_list, rows)
    lines = [
        rule(sizes, "┌", "┬", "┐"),
        "│ " + " │ ".join(h.ljust(sizes[i]) for i, h in enumerate(header_list)) + " │",
        rule(sizes, "├", "┼", "┤"),
    ]
    if not rows:
        empty = "│ " + " │ ".join("".ljust(size) for size in sizes) + " │"
        lines.append(empty)
    else:
        for row in rows:
            lines.append(
                "│ "
                + " │ ".join(row[i].ljust(sizes[i]) for i in range(len(sizes)))
                + " │"
            )
    lines.append(rule(sizes, "└", "┴", "┘"))
    return "\n".join(lines)


def is_meta_line(text: str) -> bool:
    meta = normalize_meta(text)
    if not meta:
        return False
    if meta.startswith("."):
        return True
    if meta in {"show tables", "show table", "help"}:
        return True
    if meta.startswith("describe ") or meta.startswith("desc "):
        return True
    return False


def split_statements(sql: str) -> list[str]:
    statements: list[str] = []
    buf: list[str] = []
    quote = None
    i = 0
    while i < len(sql):
        ch = sql[i]
        nxt = sql[i + 1] if i + 1 < len(sql) else ""
        if quote:
            buf.append(ch)
            if ch == quote and nxt == quote:
                buf.append(nxt)
                i += 2
                continue
            if ch == quote:
                quote = None
            i += 1
            continue
        if ch in ("'", '"'):
            quote = ch
            buf.append(ch)
            i += 1
            continue
        if ch == "-" and nxt == "-":
            while i < len(sql) and sql[i] != "\n":
                i += 1
            continue
        if ch == "/" and nxt == "*":
            i += 2
            while i < len(sql) - 1 and not (sql[i] == "*" and sql[i + 1] == "/"):
                i += 1
            i += 2
            continue
        if ch == ";":
            text = "".join(buf).strip()
            if text:
                statements.append(text)
            buf = []
            i += 1
            continue
        if ch == "\n":
            text = "".join(buf).strip()
            if is_meta_line(text):
                statements.append(text)
                buf = []
                i += 1
                continue
        buf.append(ch)
        i += 1
    tail = "".join(buf).strip()
    if tail:
        statements.append(tail)
    return statements


def normalize_meta(statement: str) -> str:
    return " ".join(statement.strip().rstrip(";").split()).lower()


def is_blocked(statement: str) -> str | None:
    meta = normalize_meta(statement)
    for prefix in BLOCKED_PREFIXES:
        if meta.startswith(prefix):
            return f"Statement blocked for safety: {prefix.upper()}"
    if meta.startswith("pragma "):
        body = meta[7:]
        for name in BLOCKED_PRAGMAS:
            if name in body:
                return f"PRAGMA {name} is disabled in this playground"
    return None


def authorizer(action, arg1, _arg2, _dbname, _source):
    if action == sqlite3.SQLITE_ATTACH:
        return sqlite3.SQLITE_DENY
    if action == sqlite3.SQLITE_DETACH:
        return sqlite3.SQLITE_DENY
    if hasattr(sqlite3, "SQLITE_RECURSIVE") and action == getattr(
        sqlite3, "SQLITE_RECURSIVE", None
    ):
        return sqlite3.SQLITE_OK
    if arg1 and str(arg1).lower() in {"readfile", "writefile"}:
        return sqlite3.SQLITE_DENY
    return sqlite3.SQLITE_OK


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    try:
        conn.enable_load_extension(False)
    except Exception:
        pass
    conn.set_authorizer(authorizer)
    conn.executescript(SEED_SQL)
    return conn


def table_names(conn: sqlite3.Connection) -> list[str]:
    rows = conn.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    return [row[0] for row in rows]


def print_banner(conn: sqlite3.Connection) -> None:
    version = sqlite3.sqlite_version
    tables = table_names(conn)
    print("┌──────────────────────────────────────────────────────────┐")
    print("│  God Compiler · SQL Playground                           │")
    print(f"│  Engine: SQLite {version:<10} · {len(tables)} seeded tables              │")
    print("├──────────────────────────────────────────────────────────┤")
    print("│  departments   employees   customers                     │")
    print("│  products      orders      order_items                   │")
    print("│  Meta: .tables   .schema [name]   .count   .help         │")
    print("└──────────────────────────────────────────────────────────┘")
    print()


def show_tables(conn: sqlite3.Connection) -> None:
    names = table_names(conn)
    rows = []
    for name in names:
        count = conn.execute(f'SELECT COUNT(*) FROM "{name}"').fetchone()[0]
        rows.append((name, count))
    print(format_table(["table", "rows"], rows))


def show_schema(conn: sqlite3.Connection, table: str | None) -> None:
    if table:
        row = conn.execute(
            "SELECT sql FROM sqlite_master WHERE type IN ('table', 'view') AND name = ? COLLATE NOCASE",
            (table,),
        ).fetchone()
        if not row or not row[0]:
            print(f"No table named '{table}'. Try .tables")
            return
        print(row[0] + ";")
        return
    rows = conn.execute(
        "SELECT name, sql FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    for name, sql in rows:
        print(f"-- {name}")
        print((sql or "") + ";")
        print()


def show_count(conn: sqlite3.Connection) -> None:
    show_tables(conn)


def describe_table(conn: sqlite3.Connection, table: str) -> None:
    info = conn.execute(f'PRAGMA table_info("{table}")').fetchall()
    if not info:
        print(f"No table named '{table}'. Try .tables")
        return
    rows = [
        (
            row["cid"],
            row["name"],
            row["type"],
            "YES" if row["notnull"] else "NO",
            row["dflt_value"],
            "PK" if row["pk"] else "",
        )
        for row in info
    ]
    print(
        format_table(
            ["#", "column", "type", "not null", "default", "key"],
            rows,
        )
    )


def handle_meta(conn: sqlite3.Connection, statement: str) -> bool:
    meta = normalize_meta(statement)
    if meta in {".help", "help"}:
        print(HELP_TEXT)
        return True
    if meta in {".tables", "show tables", "show table"}:
        show_tables(conn)
        return True
    if meta in {".count", "show counts"}:
        show_count(conn)
        return True
    if meta == ".schema" or meta.startswith(".schema "):
        table = statement.strip()[7:].strip().rstrip(";") or None
        show_schema(conn, table)
        return True
    if meta.startswith("describe ") or meta.startswith("desc ") or meta.startswith(".describe "):
        table = meta.split(" ", 1)[1].strip().strip('"').strip("`")
        describe_table(conn, table)
        return True
    return False


def run_sql(conn: sqlite3.Connection, statement: str) -> None:
    started = time.perf_counter()
    cursor = conn.execute(statement)
    elapsed_ms = (time.perf_counter() - started) * 1000
    if cursor.description:
        headers = [col[0] for col in cursor.description]
        rows = cursor.fetchmany(ROW_LIMIT + 1)
        truncated = len(rows) > ROW_LIMIT
        visible = rows[:ROW_LIMIT]
        print(format_table(headers, visible))
        extra = f"  · showing first {ROW_LIMIT}" if truncated else ""
        print(f"{min(len(rows), ROW_LIMIT)} row(s) · {elapsed_ms:.1f} ms{extra}")
    else:
        conn.commit()
        print(f"OK · {cursor.rowcount} row(s) affected · {elapsed_ms:.1f} ms")


def main() -> int:
    source_path = sys.argv[1] if len(sys.argv) > 1 else None
    if not source_path:
        print("usage: sql.playground.py query.sql", file=sys.stderr)
        return 2

    with open(source_path, "r", encoding="utf-8") as handle:
        source = handle.read()

    conn = connect()
    print_banner(conn)

    statements = split_statements(source)
    if not statements:
        print("No SQL to run. Try:\n")
        print("  SELECT name, title, salary")
        print("  FROM employees")
        print("  ORDER BY salary DESC;")
        print()
        print("Or type .help")
        return 0

    failed = False
    for index, statement in enumerate(statements, start=1):
        label = f"[{index}/{len(statements)}]"
        print(f"{label} {statement if len(statement) < 88 else statement[:85] + '…'}")
        blocked = is_blocked(statement)
        if blocked:
            print(blocked)
            failed = True
            print()
            continue
        try:
            if handle_meta(conn, statement):
                print()
                continue
            run_sql(conn, statement)
        except sqlite3.Error as exc:
            failed = True
            print(f"SQL error: {exc}")
            hint = suggest_hint(str(exc))
            if hint:
                print(f"hint: {hint}")
        print()

    conn.close()
    return 1 if failed else 0


def suggest_hint(message: str) -> str | None:
    lower = message.lower()
    if "no such table" in lower:
        return "Check the name with .tables — seeded tables are listed in the banner."
    if "no such column" in lower:
        return "Use DESCRIBE table_name to inspect columns."
    if "syntax error" in lower:
        return "SQLite dialect. End statements with a semicolon when running more than one."
    if "foreign key" in lower:
        return "Referenced id must already exist in the parent table."
    return None


if __name__ == "__main__":
    raise SystemExit(main())
