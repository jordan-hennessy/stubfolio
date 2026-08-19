FROM python:3.13-slim

WORKDIR /app

RUN pip install uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["uv", "run", "gunicorn", "stubfolio.wsgi:application", "--bind", "0.0.0.0:8000"]