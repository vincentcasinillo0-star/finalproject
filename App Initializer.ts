import { catchError , of } from 'rxjs';

import {AccountService} from './account.service';

export function appInitializer(accountService: AccountService) {
    return () => accountService.refreshToken()
    .pipe(
        catchError(() => of(null))
    );
}