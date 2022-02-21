import React, { useEffect } from 'react';
import { Grid, StyledComponentProps, StyleRulesCallback, withStyles } from '@material-ui/core';
import { compose, path } from 'ramda';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect } from 'react-redux';
import { AppState, CustomThunkDispatch } from 'app/interfaces';
import { Field, InjectedFormProps, reduxForm } from 'redux-form';
import { saveForm } from 'driverCheckList/actions/saveForm';
import {
  carOptions,
  FORM_FIELDS,
  rationOptions,
} from 'driverCheckList/constants';
import DateTimePicker from 'shared-components/lib/datePicker';
import TimeSelect from 'shared-components/lib/timePicker/timeInput';
import { injectTranslate, TranslateComponentProps } from 'translation';
import TextField from 'shared/components/textField';
import { fetchForm } from 'driverCheckList/actions/fetchForm';
import CrewType from 'driverCheckList/components/questionnaire/crewType';
import BodyDefects from 'driverCheckList/components/questionnaire/bodyDefects';
import RadioBlock from 'driverCheckList/components/questionnaire/radioBlock';
import * as selectors from 'driverCheckList/selectors';
import { ICheckList, IQuestion } from 'driverCheckList/interfaces';
import { required } from 'shared/validations';
import { getUserRoles } from 'auth/selectors';
import { ROLE_NAMES } from 'common/constants';
import ActionBar from 'driverCheckList/components/questionnaire/actionBar';

const styles: StyleRulesCallback = theme => ({
  formContainer: {
    padding: '10px 25px',
  },
});

interface QuestionnaireProps extends
  RouteComponentProps,
  InjectedFormProps,
  StyledComponentProps,
  TranslateComponentProps {
  fetchForm(id: string): void;
  getForm(id: string): void;
  checkList: ICheckList;
  readOnly: boolean;
}

const Questionnaire = (props: QuestionnaireProps) => {
  const { translate, classes, checkList, readOnly } = props;

  useEffect(() => {
    props.getForm(props.match.params.id);
  }, [props.match.params.id]);

  const renderField = (question: IQuestion, index: number) => {
    const { type, localizationLt, id } = question;
    switch (type) {
      case 'VEHICLE': {
        return <RadioBlock
          readOnly={readOnly}
          key={id}
          options={carOptions}
          id={id}
          index={index}
          isRequired={question.required}
          localizationLt={localizationLt}
        />;
      }
      case 'RATION_MVP': {
        return <RadioBlock
          readOnly={readOnly}
          key={id}
          options={rationOptions}
          id={id}
          index={index}
          isRequired={question.required}
          localizationLt={localizationLt}
        />;
      }
      case 'FREE_TEXT': {
        return (
          <Grid container item xs={12} >
            <Field
              readOnly={readOnly}
              key={id}
              name={`questions[${index}].questionValue`}
              props={{ label: translate('questionnaires.form.malfunctions') }}
              component={TextField}
              validate={[required]}
              multiline
              rows={5}
              rowsMax={25}
            />
          </Grid>
        );
      }
      default:
        return '';
    }
  };

  const columns = {
    vehicle: [],
    ration: [],
    text: [],
  };
  checkList?.questions?.forEach((question, index) => {
    if (question.type === 'RATION_MVP') {
      columns.ration.push({ ...question, index });
    } else if (question.type === 'VEHICLE') {
      columns.vehicle.push({ ...question, index });
    } else {
      columns.text.push({ ...question, index });
    }
  });

  return (
    <Grid
      item
      xs="auto"
    >
      <form onSubmit={props.handleSubmit}>
        <Grid container wrap="wrap" className={classes.formContainer}>
          <Grid item container spacing={8} xs={12}>
            <Grid item xs={6} sm={6} md={3} lg={2}>
              <Field
                readOnly={readOnly}
                name={FORM_FIELDS.DATE}
                component={DateTimePicker}
                label={translate('questionnaires.form.date')}
                inputProps={{
                  fullWidth: true,
                }}
                formatType="yyyy-MM-dd HH:mm"
                placeholder={translate('placeholders.choose')}
                showTimeInput
                customTimeInput={<TimeSelect/>}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={2} lg={2}>
              <Field
                readOnly={readOnly}
                name={FORM_FIELDS.CAR_NUMBER}
                props={{ label: translate('questionnaires.form.carNumber') }}
                component={TextField}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={2} lg={2}>
              <Field
                readOnly={readOnly}
                name={FORM_FIELDS.CREW_NUMBER}
                type="number"
                props={{ label: translate('questionnaires.form.crewNumber') }}
                component={TextField}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={2} lg={2}>
              <Field
                readOnly={readOnly}
                name={FORM_FIELDS.ITEM_NUMBER}
                type="number"
                props={{ label: translate('questionnaires.form.itemNumber') }}
                component={TextField}
              />
            </Grid>
            <CrewType readOnly={readOnly} />
            <Grid item xs={6}>
              {
                columns.vehicle.map((item) => {
                  return (
                    <div key={item.id}>
                      {
                        renderField(item, item.index)
                      }
                    </div>
                  );
                })
              }
              {
                columns.text.map((item) => {
                  return (
                    <div key={item.id}>
                      {
                        renderField(item, item.index)
                      }
                    </div>
                  );
                })
              }
            </Grid>
            <Grid item xs={6}>
              {
                columns.ration.map((item) => {
                  return (
                    <div key={item.id}>
                      {
                        renderField(item, item.index)
                      }
                    </div>
                  );
                })
              }
              <Grid item xs={12}>
                <Field
                  readOnly={readOnly}
                  disabledEditingPermissionSignature={readOnly}
                  name={FORM_FIELDS.BODY_DEFECTS}
                  component={BodyDefects}
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid item xs={12} sm={12} md={6} lg={3}>
                <Field
                  readOnly={readOnly}
                  name={FORM_FIELDS.NAME}
                  props={{ label: translate('questionnaires.form.name') }}
                  component={TextField}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <ActionBar />
      </form>
    </Grid>
  );
};

export default compose<any, any, any, any>(
  withRouter,
  injectTranslate,
  withStyles(styles),
  connect(
    (state: AppState) => ({
      readOnly: !!getUserRoles(state).find(
        (role: any) => role === ROLE_NAMES.MECHANIC,
      ),
      checkList: selectors.getCheckList(state),
    }),
    (dispatch: CustomThunkDispatch, props) => ({
      getForm(id: string) {
        dispatch(fetchForm(id));
      },
    }),
  ),
  reduxForm({
    form: 'DRIVER_CHECKLIST_FORM',
    shouldValidate: (params) => {
      const preview = path(['props', 'match', 'params', 'preview'], params);
      return preview !== 'true';
    },
    onSubmit(values, dispatch: CustomThunkDispatch) {
      return dispatch(saveForm);
    },
  }),
)(Questionnaire);
