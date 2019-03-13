/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ScoreSubjectService } from './ScoreSubject.service';
import { SubjectService } from '../Subject/Subject.service';
import { StudentService } from '../Student/Student.service';

import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-scoresubject',
  templateUrl: './ScoreSubject.component.html',
  styleUrls: ['./ScoreSubject.component.css'],
  providers: [
    ScoreSubjectService,
    SubjectService,
    StudentService
  ]
})
export class ScoreSubjectComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
  private errorMessage;

  private subjectList;
  private studentList;

  scoreSubjectId = new FormControl('', Validators.required);
  score = new FormControl('', Validators.required);
  student = new FormControl('', Validators.required);
  subject = new FormControl('', Validators.required);

  constructor(
    public serviceScoreSubject: ScoreSubjectService,
    private subjectService: SubjectService,
    private studentService: StudentService,
    fb: FormBuilder
  ) {
    this.myForm = fb.group({
      scoreSubjectId: this.scoreSubjectId,
      score: this.score,
      student: this.student,
      subject: this.subject
    });
  };

  ngOnInit(): void {
    let promiseSubject = this.loadSubject();
    let promiseStudent = this.loadStudent();
    let promiseAsset = this.loadAll();

    Promise.all([promiseAsset, promiseStudent, promiseSubject]).then(() => {
      this.allAssets.forEach(item => {
        let subjectId = item.subject.split('#')[1];
        item.subject = this.subjectList.filter(s => s.subjectId === subjectId)[0];

        let studentId = item.student.split('#')[1];
        item.student = this.studentList.filter(s => s.studentId === studentId)[0];
      });
    });
  }

  loadStudent(): Promise<any> {
    return this.studentService.getAll()
      .toPromise()
      .then((result) => {
        this.studentList = result;
      });
  }

  loadSubject(): Promise<any> {
    return this.subjectService.getAll()
      .toPromise()
      .then((result) => {
        this.subjectList = result;
      });
  }

  loadAll(): Promise<any> {
    const tempList = [];
    return this.serviceScoreSubject.getAll()
      .toPromise()
      .then((result) => {
        this.errorMessage = null;
        result.forEach(asset => {
          tempList.push(asset);
        });
        this.allAssets = tempList;
      })
      .catch((error) => {
        if (error === 'Server error') {
          this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
        } else if (error === '404 - Not Found') {
          this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
        } else {
          this.errorMessage = error;
        }
      });
  }

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the asset field to update
   * @param {any} value - the enumeration value for which to toggle the checked state
   */
  changeArrayValue(name: string, value: any): void {
    const index = this[name].value.indexOf(value);
    if (index === -1) {
      this[name].value.push(value);
    } else {
      this[name].value.splice(index, 1);
    }
  }

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
   * only). This is used for checkboxes in the asset updateDialog.
   * @param {String} name - the name of the asset field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified asset field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'org.score.ScoreSubject',
      'scoreSubjectId': this.scoreSubjectId.value,
      'score': this.score.value,
      'student': this.student.value,
      'subject': this.subject.value
    };

    this.myForm.setValue({
      'scoreSubjectId': null,
      'score': null,
      'student': null,
      'subject': null
    });

    return this.serviceScoreSubject.addAsset(this.asset)
      .toPromise()
      .then(() => {
        this.errorMessage = null;
        this.myForm.setValue({
          'scoreSubjectId': null,
          'score': null,
          'student': null,
          'subject': null
        });
        this.loadAll();
      })
      .catch((error) => {
        if (error === 'Server error') {
          this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
        } else {
          this.errorMessage = error;
        }
      });
  }


  updateAsset(form: any): Promise<any> {
    this.asset = {
      $class: 'org.score.ScoreSubject',
      'score': this.score.value,
      'student': this.student.value,
      'subject': this.subject.value
    };

    return this.serviceScoreSubject.updateAsset(form.get('scoreSubjectId').value, this.asset)
      .toPromise()
      .then(() => {
        this.errorMessage = null;
        this.loadAll();
      })
      .catch((error) => {
        if (error === 'Server error') {
          this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
        } else if (error === '404 - Not Found') {
          this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
        } else {
          this.errorMessage = error;
        }
      });
  }


  deleteAsset(): Promise<any> {

    return this.serviceScoreSubject.deleteAsset(this.currentId)
      .toPromise()
      .then(() => {
        this.errorMessage = null;
        this.loadAll();
      })
      .catch((error) => {
        if (error === 'Server error') {
          this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
        } else if (error === '404 - Not Found') {
          this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
        } else {
          this.errorMessage = error;
        }
      });
  }

  setId(id: any): void {
    this.currentId = id;
  }

  getForm(id: any): Promise<any> {

    return this.serviceScoreSubject.getAsset(id)
      .toPromise()
      .then((result) => {
        this.errorMessage = null;
        const formObject = {
          'scoreSubjectId': null,
          'score': null,
          'student': null,
          'subject': null
        };

        if (result.scoreSubjectId) {
          formObject.scoreSubjectId = result.scoreSubjectId;
        } else {
          formObject.scoreSubjectId = null;
        }

        if (result.score) {
          formObject.score = result.score;
        } else {
          formObject.score = null;
        }

        if (result.student) {
          formObject.student = result.student;
        } else {
          formObject.student = null;
        }

        if (result.subject) {
          formObject.subject = result.subject;
        } else {
          formObject.subject = null;
        }

        this.myForm.setValue(formObject);

      })
      .catch((error) => {
        if (error === 'Server error') {
          this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
        } else if (error === '404 - Not Found') {
          this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
        } else {
          this.errorMessage = error;
        }
      });
  }

  resetForm(): void {
    this.myForm.setValue({
      'scoreSubjectId': null,
      'score': null,
      'student': null,
      'subject': null
    });
  }

}
