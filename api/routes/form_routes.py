from forms.responseform import ResponseForm
from api import app
from flask import render_template, flash, redirect

@app.route('/response_form', methods=['GET', 'POST']) 
def response_form():
    form = ResponseForm()
    if form.validate_on_submit():
        flash('New response requested {}'.format(
            form.response.data))
        app.config['RESPONSE'] = form.response.data
        return redirect('index')
    return render_template('response_form.html', title='Update Response', form=form)