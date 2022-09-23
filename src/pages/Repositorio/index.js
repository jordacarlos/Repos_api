import React,{useState, useEffect} from "react"
import { Container,Owner,Loading,BackButton,IssuesList,PageActions,BtnOptions } from "./styles"
import {FaArrowLeft} from 'react-icons/fa'
import api from '../../services/api'

export default function Repositorio({match}){

    const [repositorio, setRepositorio] = useState({});
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    
    //const [btnOptions, setBtnOptions] = useState('all');

    const [filters, setFilters] = useState([
        {state: 'all', label: 'Todas', active: true},
        {state: 'open', label: 'Abertas', active: false},
        {state: 'closed', label: 'Fechadas', active: false},
      ]);

    const [filterIndex, setFilterIndex] = useState(0);

    useEffect(() =>{
    async function load(){
        const nomeRepo = decodeURIComponent(match.params.repositorio)
    
        ///Pega as duas resposta da api em 1 promise so
         const [repositorioData, issuesData ] = await Promise.all([
            api.get(`/repos/${nomeRepo}`),
            api.get(`/repos/${nomeRepo}/issues`,{
                params:{
                    state: filters.find(f => f.active).state,
                    per_page: 5
                }
            })
        ])
        setRepositorio(repositorioData.data);
        setIssues(issuesData.data);
       
        setLoading(false);
    }
    load();

    },[filters,match.params.repositorio])


    useEffect(() =>{

        async function loadIssue(){
            const nomeRepo = decodeURIComponent(match.params.repositorio);

            const response = await api.get(`/repos/${nomeRepo}/issues`,{
                params:{
                    state: filters[filterIndex].state,
                    page,
                    per_page: 5
                },
            });
            setIssues(response.data)
        }

        loadIssue();

    },[filterIndex, filters,match.params.repositorio, page])


    function handlePage(action){
        setPage(action === 'back' ? page -1 : page +1)
    }

    /* function handleFilter(action){
        setBtnOptions(action)
        }
    */
    function handleFilter(index){
        setFilterIndex(index);
    }


    if(loading){
        return(
            <Loading>

            </Loading>
        )
    }

    return(

        <Container>
            <BackButton to="/">
                <FaArrowLeft color="#000" size={35} />
            </BackButton>
            <Owner>
                <img src ={repositorio.owner.avatar_url} alt={repositorio.owner.login} />
                <h1>{repositorio.name}</h1>
                <p>{repositorio.description}</p>
            </Owner>
            <BtnOptions active={filterIndex} >
            {filters.map((filter, index) => (
                <button type="button" key={filter.label} onClick={()=> handleFilter(index)}>
                {filter.label}
                </button>
            ))}
                {/*Modo sem map
                    <button type="button" onClick={() =>{handleFilter('open')}} disabled = {btnOptions === 'open'}>Open</button><button 
                    type="button"  onClick={() => {handleFilter('closed')}} disabled = {btnOptions === 'closed'}>Close </button> 
                    <button type="button"  onClick={() => {handleFilter('all')}} disabled = {btnOptions === 'all'}> All </button>
                */}
            </BtnOptions>
             
            <IssuesList>
                {issues.map(issue =>(
                    <li key={String(issue.id)}>
                        <img src={issue.user.avatar_url} alt={issue.user.login} />
                        
                        <div>
                            <strong>
                                <a href={issue.html_url}>{issue.title} </a>

                                {issue.labels.map(label =>(
                                    <span key={String(label.id)}>{label.name}</span>
                                ))}
                            </strong>
                            <p>{issue.user.login}</p>
                        </div>

                    </li>
                ))}
            </IssuesList>
            <PageActions>
                <button 
                type="button" 
                onClick={() =>{handlePage('back')}}
                disabled = {page < 2}
                >
                    Voltar
                </button>
                <button type="button" onClick={() => {handlePage('next')}}>
                    Next
                </button>
            </PageActions>
        </Container>
            

    )
}