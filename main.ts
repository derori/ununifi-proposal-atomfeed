import http, { IncomingMessage, ServerResponse } from 'http'
import axios from 'axios';
import { Feed } from 'feed';
import 'dotenv/config';

const propsEndpoint = process.env.PROPS_ENDPOINT || '';

const fetchProposals = (async () => {
    const feed = new Feed({
        title: "Ununifi Proposal",
        id: "Ununifi proposals feed via any node api.",
        copyright: "Ununifi gov",
    });
    const { data } = await axios.get(propsEndpoint);
    const ooo: GovV1ProposalResponse[] = await data.proposals as GovV1ProposalResponse[];
    for await (const oo of ooo) {
        if (!oo.id) continue;
        feed.addItem({
            title: `VotingEnd: ${new Date(oo.voting_end_time).toISOString()} **${oo.title}`,
            link: `${process.env.LINK_BASE_URL}${oo.id}`,
            date: new Date(oo.submit_time),
            id: oo.id.toString(),
        });
    }
    return feed;

    interface GovV1betaProposalResponse {
        content: {
            '@type': string,
            description: string,
            title: string
        },
        deposit_end_time: Date,
        final_tally_result: {},
        is_expedited: boolean,
        proposal_id: string,
        status: string,
        submit_time: string,
        total_deposit: {},
        voting_end_time: string,
        voting_start_time: Date
    }
    interface GovV1ProposalResponse {
        id: number,
        messages: {
            '@type': string,
            content: {
                description?: string,
                title?: string,
                plan?: {
                    name: string,
                    time: Date,
                    height: Number,
                    info: string,
                    upgraded_client_state: boolean
                },
            },
            authority: string,
        }[],
        status: string,
        final_tally_result: {},
        submit_time: Date,
        deposit_end_time: Date,
        total_deposit: {},
        voting_start_time: Date
        voting_end_time: Date,
        metadata: string,
        title: string,
        summary: string,
        proposer: string,
    }
});
const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const feed = await fetchProposals();
    res.writeHead(200, { 'Content-Type': 'application/atom+xml' });
    res.end(feed.atom1());
})

server.listen(4000) // 4000番ポートで起動


// const feed = fetchProposals().then((f) => {
//     f.atom1();
// });
