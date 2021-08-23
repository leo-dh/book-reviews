import os


def manage_env(name: str):
    env = os.getenv(name)
    if env is not None:
        return env

    env = os.getenv(f"{name}_FILE")
    if env is not None:
        if "/run/secrets" in env and os.path.exists(env):
            return open(env).read().rstrip("\n")

    raise KeyError(f"{name}")


def get_allowed_hosts():
    allowed_hosts = os.getenv("ALLOWED_HOSTS")
    if allowed_hosts is None:
        return []
    else:
        return allowed_hosts.split(",")
