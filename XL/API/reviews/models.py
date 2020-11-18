from django.db import models
from django.db.models import fields
from django.forms.models import ModelForm, model_to_dict
from django.utils import timezone
from django.core.exceptions import ValidationError


def overall_validator(value):
    if value > 5:
        raise ValidationError("Value must be less than or equal to 5.")


class Review(models.Model):
    review_id = models.AutoField(primary_key=True)
    asin = models.CharField(max_length=10)  # exact: 10
    helpful_num = models.IntegerField()
    helpful_denom = models.IntegerField()
    overall = models.IntegerField(validators=[overall_validator])
    text = models.TextField()
    summary = models.CharField(max_length=512)  # max: 325
    date = models.DateTimeField()
    reviewer_id = models.CharField(max_length=32)  # max: 21
    reviewer_name = models.CharField(max_length=64)  # max: 49

    def values(self):
        return model_to_dict(self)
