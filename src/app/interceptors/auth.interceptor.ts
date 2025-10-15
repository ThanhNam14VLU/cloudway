import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { supabase } from '../supabase.client';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Chỉ đính kèm token cho request tới backend API của mình
  const isBackendApiRequest = req.url.startsWith(environment.apiUrl);
  if (!isBackendApiRequest) {
    return next(req);
  }

  return from(supabase.auth.getSession()).pipe(
    mergeMap(({ data }) => {
      const token = data?.session?.access_token;
      if (!token) {
        return next(req);
      }

      const authReq: HttpRequest<unknown> = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next(authReq);
    })
  );
};


