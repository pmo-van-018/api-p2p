import {MigrationInterface, QueryRunner} from "typeorm";

export class updateBankList1685602489257 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query('UPDATE master_data_common SET supported_bank_list = "vietcombank,vietinbank,techcombank,mbbank,vpbank,acb,bidv,tpbank,vib,agribank,hdbank,sacombank,shb,ocb,msb,abbank,bacabank,dongabank,eximbank,gpbank,hsbc,namabank,ncb,pgbank,pvcombank,saigonbank,scb,seabank,vietabank,vietbank" WHERE 1=1')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        return null;
    }

}
