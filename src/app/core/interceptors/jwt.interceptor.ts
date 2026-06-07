import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth/auth.service';

/**
 * Attaches the Bearer token to every non-auth request. On 401, silently refreshes
 * the access token once and retries; if refresh fails, logs the user out.
 * Rate-limit (429) errors on auth endpoints are surfaced as a snack-bar message.
 */

// Module-level singletons prevent multiple simultaneous refresh calls (refresh storm guard).
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function isAuthEndpoint(url: string): boolean {
  return url.includes('/api/auth/');
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const snackBar = inject(MatSnackBar);
  const token = auth.token();

  const authReq = token && !isAuthEndpoint(req.url)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) return throwError(() => err);

      if (err.status === 429 && isAuthEndpoint(req.url)) {
        snackBar.open('Too many attempts, please wait a minute', 'OK', { duration: 6000 });
        return throwError(() => err);
      }

      if (err.status === 401) {
        if (isAuthEndpoint(req.url)) {
          auth.logout();
          return throwError(() => err);
        }
        return handle401(req, next, auth);
      }

      return throwError(() => err);
    })
  );
};

/**
 * Handles a 401 from a non-auth endpoint. If a refresh is already in progress,
 * queues the request on `refreshTokenSubject` to retry once the new token arrives.
 */
function handle401(req: HttpRequest<unknown>, next: HttpHandlerFn, auth: AuthService) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = auth.user()?.refreshToken;
    if (!refreshToken) {
      isRefreshing = false;
      auth.logout();
      return throwError(() => new Error('No refresh token'));
    }

    return auth.refresh(refreshToken).pipe(
      switchMap(user => {
        isRefreshing = false;
        refreshTokenSubject.next(user.accessToken);
        return next(req.clone({ setHeaders: { Authorization: `Bearer ${user.accessToken}` } }));
      }),
      catchError(err => {
        isRefreshing = false;
        auth.logout();
        return throwError(() => err);
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))),
  );
}
