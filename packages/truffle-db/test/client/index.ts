import gql from "graphql-tag";
import { toGlobalId } from "graphql-relay-tools";

import { TruffleDB } from "truffle-db/db";

export class TestClient {
  private db: TruffleDB;

  constructor (config) {
    this.db = new TruffleDB(config);
  }

  async execute (request, variables = {}) {
    const result = await this.db.execute(request, variables);

    if (result.data) {
      return result.data;
    } else {
      throw new Error(result);
    }
  }

  async addBytecode({ bytes }) {
    const AddBytecode = gql`
      mutation AddBytecode($bytes: Bytes!) {
        workspace {
          bytecodesAdd(input: {
            bytecodes: [{
              bytes: $bytes
            }]
          }) {
            bytecodes {
              id
            }
          }
        }
      }
    `;

    const data = await this.execute(AddBytecode, { bytes });
    const { workspace } = data;
    const { bytecodesAdd } = workspace;
    const { bytecodes } = bytecodesAdd;
    const bytecode = bytecodes[0];
    const { id } = bytecode;

    return toGlobalId("Bytecode", id);
  }

  async addSource({ contents, sourcePath }: Partial<DataModel.ISource>) {
    const AddSource = gql`
      mutation AddSource($contents: String!, $sourcePath: String) {
        workspace {
          sourcesAdd(input: {
            sources: [{
              contents: $contents,
              sourcePath: $sourcePath
            }]
          }) {
            sources {
              id
            }
          }
        }
      }
    `;

    const data = await this.execute(AddSource, { contents, sourcePath });
    const { workspace } = data;
    const { sourcesAdd } = workspace;
    const { sources } = sourcesAdd;
    const source = sources[0];
    const { id } = source;

    return toGlobalId("Source", id);
  }
}

