import json

from kafka import KafkaProducer

from app.config import settings


def get_producer() -> KafkaProducer:
    return KafkaProducer(
        bootstrap_servers=settings.kafka_bootstrap_servers,
        value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode("utf-8"),
    )


def send_task_event(event: str, task_id: int, title: str) -> None:
    producer = get_producer()
    try:
        producer.send("tasks", {"event": event, "task_id": task_id, "title": title})
        producer.flush(timeout=5)
    finally:
        producer.close(timeout=5)

