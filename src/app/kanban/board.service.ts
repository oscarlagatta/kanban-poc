import { Injectable, resolveForwardRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { switchMap, map } from 'rxjs/operators';
import { Board, Task } from './board.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore
  ) { }

  /**
   * Creates a new board for the current user
   */
  async createBoard(data: Board) {
    const user = await this.afAuth.auth.currentUser;
    return this.db.collection('boards').add({
      ...data,
      uid: user.uid,
      tasks: [{ description: 'Hello', label: 'yellow'}]
    });
  }

  /**
   * Delete board
   */
  deleteBoard(boardId: string) {
    return this.db
      .collection('boards')
      .doc(boardId)
      .delete();
  }

  /**
   * Updates the tasks on board
   */
  updateTasks(boardId: string, tasks: Task[]) {
    return this.db
      .collection('boards')
      .doc(boardId)
      .update( {tasks});
  }

  /**
   * Remove a specific task from the board
   */
  removeTask(boardId: string, task: Task){
    return this.db
      .collection('boards')
      .doc(boardId)
      .update({
        tasks: firebase.firestore.FieldValue.arrayRemove()
      });
  }


  /**
   * Get all boards owned byt current user, we need to retrieve
   * based on the order that are sorted in the database. We need
   *  the userId to make this query and we want to make sure that
   * everything stays updated in real time.
   * Instead of getting the user as a promise we get the current
   * use authState as an Observable.
   */
  getUserBoards() {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.db
            .collection<Board>('boards', ref =>
              ref.where('uid', '==', user.uid).orderBy('priority')
            )
            .valueChanges({ idField: 'id'});
        } else {
          return [];
        }

      })
    );
  }

  /// Create a composite index
  /// Cloud Firestore uses composite indexes for compound queries not already supported by single-field indexes
  /// (e.g. combining equality and range operators).


  /**
   * Run a batch write to change the priority of each board for sorting
   * This is the most interesting one because it requires a batch or
   * transaction, each board is an individual document
   * and Firestore when the user changes the order will need to iterate
   * over all those boards and figure out what the new ordering is.
   * The easiest way to do that is to figure out what the intended ordering
   * is; based on the user's interaction in the front end; and then send
   * that entire array of boards to firestore and update the priority
   * on each one. But we want to make sure that all those either
   * fail or succeed together because it only one or two of them worked
   * and the other ones didn't then we would have boards that were all
   * out of sync, so with "batch" If one of your rights failed to know all roll back to the previous
   * state and I Will be represented in the UI as well because Firestore
   * will update everything in real time, will run a batch right by interacting
   * with the Firebase SDK directly.
   *
   */
  sortBoards(boards: Board[]) {
    const db = firebase.firestore();
    const batch = db.batch();

    const refs = boards.map( b => db.collection('boards').doc(b.id));
    refs.forEach( (ref, idx) => batch.update(ref, { priority: idx}));

    batch.commit();
  }

}
