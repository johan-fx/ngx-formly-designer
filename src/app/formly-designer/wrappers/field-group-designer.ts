import { ChangeDetectorRef, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FieldWrapper, FormlyConfig, FormlyFieldConfig } from 'ng-formly';
import { FormlyDesignerService } from '../formly-designer.service';
import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs/Rx';


@Component({
    selector: 'formly-wrapper-field-group-designer',
    template: `
        <div *ngIf="!editing && active" class="dropdown">
            <button class="btn btn-sm btn-info mr-3" type="button" id="editorMenuButton"
                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fa fa-cogs" aria-hidden="true"></i>
            </button>
            <div class="dropdown-menu" aria-labelledby="editorMenuButton">
                <div class="dropdown-item" (click)="edit()">Edit</div>
                <a class="dropdown-item" (click)="remove()">Remove</a>
            </div>
        </div>
        <div class="content">
            <div [hidden]="!editing">
                <field-group-editor #editor [formControl]="fieldEdit" [field]="fieldSource">
                    <div class="footer">
                        <button (click)="cancel()" class="btn btn-secondary btn-sm mr-1">Cancel</button>
                        <button [disabled]="editor.invalid" (click)="accept()" class="btn btn-primary btn-sm">Apply</button>
                    </div>
                </field-group-editor>
            </div>
            <div [hidden]="editing">
                <ng-container #fieldComponent></ng-container>
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: flex;
            justify-content: flex-start;
            align-content: flex-start;
            align-items: flex-start;
            margin: .25em;
        }
        field-group-editor .footer {
            display: flex;
            justify-content: flex-end;
        }
        .content {
            border: 1px dashed #000;
            border-radius: 5px;
            padding: 1em;
            width: 100%;
        }
    `]
})
export class FormlyWrapperFieldGroupDesignerComponent extends FieldWrapper {
    @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

    editing = false;
    fieldEdit = new FormControl({});
    fieldSource: FormlyFieldConfig;

    get active(): boolean {
        return this.formlyDesignerService.active;
    }

    constructor(
        private changeDetector: ChangeDetectorRef,
        private formlyConfig: FormlyConfig,
        private formlyDesignerService: FormlyDesignerService
    ) {
        super();
    }

    edit(): void {
        this.editing = true;
        this.formlyDesignerService.active = false;
        this.fieldSource = this.formlyDesignerService.convertField(cloneDeep(this.field));
    }

    remove(): void {
        this.formlyDesignerService.removeField(this.field);
    }

    accept(): void {
        Observable.timer().subscribe(() => {
            this.formlyDesignerService.updateField(this.field, this.fieldEdit.value);
            this.formlyDesignerService.active = true;
            this.editing = false;
        });
    }

    cancel(): void {
        const fieldEdit = cloneDeep(this.fieldEdit.value);
        fieldEdit.key = this.field.key;
        Observable.timer().subscribe(() => {
            this.formlyDesignerService.updateField(this.field, fieldEdit);
            this.formlyDesignerService.active = true;
            this.editing = false;
        });
    }
}