"""Small helper so other apps don't need to know AuditLog's field layout."""

from .models import AuditLog


def log_action(actor, action, target=None, **metadata):
    """
    actor: User instance or None (system-generated events)
    action: one of AuditLog.Action
    target: any model instance (its class name + pk are stored) or None
    metadata: arbitrary extra key/values, stored as JSON
    """
    AuditLog.objects.create(
        actor=actor,
        action=action,
        target_type=target.__class__.__name__ if target else '',
        target_id=getattr(target, 'pk', None),
        metadata=metadata,
    )
