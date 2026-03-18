import json

from kafka import KafkaConsumer

from app.config import settings


def run() -> None:
    consumer = KafkaConsumer(
        "tasks",
        bootstrap_servers=settings.kafka_bootstrap_servers,
        auto_offset_reset="earliest",
        enable_auto_commit=False,
        group_id=None,
        value_deserializer=lambda b: json.loads(b.decode("utf-8")),
    )
    for msg in consumer:
        print("KAFKA EVENT:", msg.value)


if __name__ == "__main__":
    run()

