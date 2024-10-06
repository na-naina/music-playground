from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired

class ResponseForm(FlaskForm):
    response = StringField('New Response', validators=[DataRequired()])
    submit = SubmitField('Submit')
