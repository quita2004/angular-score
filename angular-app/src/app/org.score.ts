import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
// export namespace org.score{
   export class Student extends Participant {
      studentId: string;
      name: string;
      address: string;
   }
   export class Teacher extends Participant {
      teacherId: string;
      name: string;
      address: string;
   }
   export class ScoreSubject extends Asset {
      scoreSubjectId: string;
      score: number;
      student: Student;
      subject: Subject;
   }
   export class Subject extends Asset {
      subjectId: string;
      SubjectName: string;
   }
   export class ChangeScore extends Transaction {
      scoreSubject: ScoreSubject;
      newScore: number;
   }
   export class ChangeScoreEvent extends Event {
      scoreSubject: ScoreSubject;
      newScore: number;
      oldScore: number;
   }
// }
