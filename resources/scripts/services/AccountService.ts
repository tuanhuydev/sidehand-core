import { Account } from 'scripts/utils/interfaces';
import { httpClientWithAuth } from 'scripts/utils/httpClient';

class AccountService {
  path: string = '/accounts';

  public patchAccount = (data: Partial<Account>) => {
    const { accountId, ...restData } = data;
    const url = `${this.path}/${accountId}`;
    return httpClientWithAuth.patch(url, restData);
  };
}

export default AccountService;
