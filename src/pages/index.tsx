import { GetStaticProps } from 'next';
import {format, parseISO} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

type Episode = {
    id: string;
    title: string;
    members: string;
    published_at: string;
}

type HomeProps = {
    episodes: Episode[];
}

export default function Home(props: HomeProps){
    return (
        <div>
            <h1>Index</h1>
            <p>{JSON.stringify(props.episodes)}</p>
        </div>
    );
}

//NOTA: formatação em dados que venha da API deve ser feita no SSG. Isso evita com que a formatação seja feita
//sempre que a página é recarregada e assim esses dados nao sao renderizados.

//Adicionando o conceito de SSG (Static Site Generator)
export const getStaticProps: GetStaticProps = async () => { 
    const {data} = await api.get('episodes', {
        params: {
            _limit:1,
            _sort: 'published_at',
            _order: 'desc'
        }
    })

    const episodes = data.map(episode =>{
        return{
            id: episode.id,
            title: episode.title,
            thumbnail: episode.thumbnail,
            members: episode.members,
            publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {locale: ptBR}),
            duration: Number(episode.file.duration),
            durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
            description: episode.description,
            url: episode.file.url,
        };
    })

    return {
        props: {
            episodes: episodes,
        },
        revalidate: 60 * 60 * 8,
    }
}