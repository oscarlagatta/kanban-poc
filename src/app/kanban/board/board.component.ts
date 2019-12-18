import { Component, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BoardService } from '../board.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {
  @Input() board;

  constructor(private boardService: BoardService) {}

  /**
   * This event will happen when one task object is moved within
   * the same board. The taskDrop event handler is almost identical
   * to the board-list component the only difference is we are calling
   * different method in the service because in this instance we are reordering
   * the task list.
   * @param event
   */
  taskDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.board.tasks, event.previousIndex, event.currentIndex);
    this.boardService.updateTasks(this.board.id, this.board.tasks);
  }
}
