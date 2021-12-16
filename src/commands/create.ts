import type { Arguments, CommandBuilder } from 'yargs';

type Options = {
  user: string | undefined;
  file: string | undefined;
  endpoint: string;
  auth: string;
};

export const command: string = 'create';
export const desc: string = 'Create a new user with the given JSON';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      endpoint: { type: 'string', default: 'http://localhost:8080', alias: 'e', describe: 'The endpoint used to connect to Thunder' },
      auth: { type: 'string', default: 'application:secret', alias: 'a', describe: 'Basic authentication credentials' },
      file: { type: 'string', alias: 'f', conflicts: 'user', describe: 'A path to a JSON file describing the user to create', coerce: (arg) => {
        if (!arg) return undefined;
        return JSON.parse(require('fs').readFileSync(arg, { encoding: 'utf8', flag: 'r' }))
      }},
      user: { type: 'string', alias: 'u', conflicts: 'file', describe: 'A JSON string describing the user to create', coerce: (arg) => {
        if (!arg) return undefined;
        return JSON.parse(arg)
      }}
    })
    .check((argv) => {
      if (argv.user || argv.file) {
         return true;
      } else {
         throw new Error('Error: pass either user or file option to create a user');
      }
    })
    .example('$0 create -u \'{ "email": { "address": "test@test.com" }, "password": "secret" }\'', 'Create a user with inline JSON')
    .example('$0 create -f user.json', 'Create a user with a JSON file that describes the user');

export const handler = (argv: Arguments<Options>): void => {
  const { user, endpoint, file, auth } = argv;
  
  let finalUser = user ? user : file;
  let authUser = auth.split(":")[0];
  let authPass = auth.split(":")[1];

  const ThunderClient = require('thunder-client');
  let thunder = new ThunderClient(endpoint, authUser, authPass);

  thunder.createUser(finalUser, (err: Error, statusCode: any, result: any) => {
    if (err) {
      process.stderr.write(`[ERROR CODE ${statusCode}] ${result}`);
      process.exit(1);
    } else {
      process.stdout.write(JSON.stringify(result));
      process.exit(0);
    }
  });
};
