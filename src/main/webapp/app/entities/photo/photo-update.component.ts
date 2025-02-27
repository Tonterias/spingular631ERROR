import { Component, OnInit, ElementRef } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as moment from 'moment';
import { DATE_TIME_FORMAT } from 'app/shared/constants/input.constants';
import { JhiAlertService, JhiDataUtils } from 'ng-jhipster';
import { IPhoto, Photo } from 'app/shared/model/photo.model';
import { PhotoService } from './photo.service';
import { IAlbum } from 'app/shared/model/album.model';
import { AlbumService } from 'app/entities/album/album.service';
import { ICalbum } from 'app/shared/model/calbum.model';
import { CalbumService } from 'app/entities/calbum/calbum.service';

@Component({
  selector: 'jhi-photo-update',
  templateUrl: './photo-update.component.html'
})
export class PhotoUpdateComponent implements OnInit {
  isSaving: boolean;

  albums: IAlbum[];

  calbums: ICalbum[];

  editForm = this.fb.group({
    id: [],
    creationDate: [null, [Validators.required]],
    image: [],
    imageContentType: [],
    albumId: [],
    calbumId: []
  });

  constructor(
    protected dataUtils: JhiDataUtils,
    protected jhiAlertService: JhiAlertService,
    protected photoService: PhotoService,
    protected albumService: AlbumService,
    protected calbumService: CalbumService,
    protected elementRef: ElementRef,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ photo }) => {
      this.updateForm(photo);
    });
    this.albumService
      .query()
      .pipe(
        filter((mayBeOk: HttpResponse<IAlbum[]>) => mayBeOk.ok),
        map((response: HttpResponse<IAlbum[]>) => response.body)
      )
      .subscribe((res: IAlbum[]) => (this.albums = res), (res: HttpErrorResponse) => this.onError(res.message));
    this.calbumService
      .query()
      .pipe(
        filter((mayBeOk: HttpResponse<ICalbum[]>) => mayBeOk.ok),
        map((response: HttpResponse<ICalbum[]>) => response.body)
      )
      .subscribe((res: ICalbum[]) => (this.calbums = res), (res: HttpErrorResponse) => this.onError(res.message));
  }

  updateForm(photo: IPhoto) {
    this.editForm.patchValue({
      id: photo.id,
      creationDate: photo.creationDate != null ? photo.creationDate.format(DATE_TIME_FORMAT) : null,
      image: photo.image,
      imageContentType: photo.imageContentType,
      albumId: photo.albumId,
      calbumId: photo.calbumId
    });
  }

  byteSize(field) {
    return this.dataUtils.byteSize(field);
  }

  openFile(contentType, field) {
    return this.dataUtils.openFile(contentType, field);
  }

  setFileData(event, field: string, isImage) {
    return new Promise((resolve, reject) => {
      if (event && event.target && event.target.files && event.target.files[0]) {
        const file: File = event.target.files[0];
        if (isImage && !file.type.startsWith('image/')) {
          reject(`File was expected to be an image but was found to be ${file.type}`);
        } else {
          const filedContentType: string = field + 'ContentType';
          this.dataUtils.toBase64(file, base64Data => {
            this.editForm.patchValue({
              [field]: base64Data,
              [filedContentType]: file.type
            });
          });
        }
      } else {
        reject(`Base64 data was not set as file could not be extracted from passed parameter: ${event}`);
      }
    }).then(
      // eslint-disable-next-line no-console
      () => console.log('blob added'), // success
      this.onError
    );
  }

  clearInputImage(field: string, fieldContentType: string, idInput: string) {
    this.editForm.patchValue({
      [field]: null,
      [fieldContentType]: null
    });
    if (this.elementRef && idInput && this.elementRef.nativeElement.querySelector('#' + idInput)) {
      this.elementRef.nativeElement.querySelector('#' + idInput).value = null;
    }
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    const photo = this.createFromForm();
    if (photo.id !== undefined) {
      this.subscribeToSaveResponse(this.photoService.update(photo));
    } else {
      this.subscribeToSaveResponse(this.photoService.create(photo));
    }
  }

  private createFromForm(): IPhoto {
    return {
      ...new Photo(),
      id: this.editForm.get(['id']).value,
      creationDate:
        this.editForm.get(['creationDate']).value != null ? moment(this.editForm.get(['creationDate']).value, DATE_TIME_FORMAT) : undefined,
      imageContentType: this.editForm.get(['imageContentType']).value,
      image: this.editForm.get(['image']).value,
      albumId: this.editForm.get(['albumId']).value,
      calbumId: this.editForm.get(['calbumId']).value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPhoto>>) {
    result.subscribe(() => this.onSaveSuccess(), () => this.onSaveError());
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  trackAlbumById(index: number, item: IAlbum) {
    return item.id;
  }

  trackCalbumById(index: number, item: ICalbum) {
    return item.id;
  }
}
