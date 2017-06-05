import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormlyFieldConfig } from 'ng-formly';
import { FormlyDesignerConfig } from '../formly-designer-config';
import { cloneDeep, isArray, isObject } from 'lodash';


declare var $: any;

@Component({
    selector: 'wrapper-picker',
    template: `
        <form novalidate [formGroup]="form">
            <div class="form-group">
                <div class="input-group">
                    <wrapper-select formControlName="wrapper">
                    </wrapper-select>
                    <button type="button" class="btn btn-secondary" [disabled]="form.invalid" (click)="add()">
                        Add
                    </button>
                </div>
            </div>
            <div #modal class="modal fade" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Add {{ wrapper }}</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Cancel">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <wrapper-editor #editor [formControl]="fieldEdit" [wrapper]="wrapper">
                            </wrapper-editor>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" (click)="onApply()"
                                [disabled]="editor.invalid">Apply</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    `,
    styles: [`
        .btn:not(:disabled) {
            cursor: pointer;
        }
        .input-group > .btn {
            border-radius: 0 .25rem .25rem 0;
        }
        .input-group, .modal-header {
            display: flex;
        }
        .modal-header {
            justify-content: space-between;
        }
        wrapper-select {
            flex-grow: 2;
        }
        :host /deep/ wrapper-select > select {
            border-radius: .25rem 0 0 .25rem;
            border-right: 0;
        }
        ::after {
            display: none !important;
        }
    `]
})
export class WrapperPickerComponent implements OnInit {
    @ViewChild('modal') modalRef: ElementRef;
    @Input() field: FormlyFieldConfig;
    @Output() selected = new EventEmitter<FormlyFieldConfig>();

    constructor(
        private formBuilder: FormBuilder,
        private formlyDesignerConfig: FormlyDesignerConfig
    ) { }

    form: FormGroup;
    fieldEdit = new FormControl({});

    get wrapper(): string {
        return this.form.get('wrapper').value;
    }

    private get modal(): any {
        return $(this.modalRef.nativeElement);
    }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            wrapper: ['', Validators.compose([Validators.required, Validators.pattern(/^\s*\S.*$/)])]
        });
    }

    add(): void {
        if (isObject(this.field)) {
            const field = cloneDeep(this.field);
            if (isArray(field.wrappers)) {
                field.wrappers.push(this.wrapper);
            }
            else {
                field.wrappers = [this.wrapper];
            }
            this.fieldEdit.setValue(field);

            const fields = this.formlyDesignerConfig.wrappers[this.wrapper].fields;
            if (isArray(fields) && fields.length > 0) {
                this.modal.modal('show');
            }
            else {
                this.selected.emit(this.fieldEdit.value);
            }
        }
    }

    onApply(): void {
        this.selected.emit(this.fieldEdit.value);
        this.modal.modal('hide');
    }
}
