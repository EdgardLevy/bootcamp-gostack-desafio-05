import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Loading, Owner, IssueList, IssueHeader } from './styles';
import api from '../../services/api';
import Container from '../../components/Container';


// dentro da propriedade match tem os parametros da rotas
export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    issueState: 'open',
    itemsPerPage: 5,
    repoName: '',
    issuesPage: 1

  };

  loadRepository = async (repoName) => {
    console.log('loadRepository')
    const { issueState, itemsPerPage, issuesPage } = this.state;

    console.log(issueState, itemsPerPage, repoName)
    // carrega os dados do repositorio e os issues
    // atraves de duas promises asyncronas
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issueState,
          per_page: itemsPerPage,
          page: issuesPage
        },
      }),
    ]);

    console.log(repository);
    console.log(issues);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
      repoName
    });
  }

  loadIssues = async () => {
    console.log('loadRepository')
    const { issueState, itemsPerPage, repoName, issuesPage } = this.state;

    console.log(issueState, itemsPerPage, repoName)
    // carrega os dados do repositorio e os issues
    // atraves de duas promises asyncronas
    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: issueState,
        per_page: itemsPerPage,
        page: issuesPage
      },
    });


    console.log(issues);

    this.setState({
      issues: issues.data,
      loading: false,
    });
  }

  handleIssueState = (e) => {
    const issueState = e.target.value;
    this.setState({ issueState, loading: true })
  }

  handleItemsPerPage = (e) => {
    const itemsPerPage = e.target.value;
    this.setState({ itemsPerPage, loading: true })
  }

  btnNextPageClick = () => {
    const { issuesPage } = this.state;

    this.setState({ issuesPage: issuesPage + 1 })
  }

  btnPriorPageClick = () => {
    const { issuesPage } = this.state;
    if (issuesPage === 1) return

    this.setState({ issuesPage: issuesPage - 1 })
  }

  componentDidMount() {
    console.log('componentDidMount');
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);
    this.loadRepository(repoName);
  }

  componentDidUpdate(_, prevState) {
    console.log('componentDidUpdate');
    const { issueState, itemsPerPage, issuesPage } = this.state;
    console.log(issueState, itemsPerPage)
    if (
      (issueState !== prevState.issueState) ||
      (itemsPerPage !== prevState.itemsPerPage) ||
      (issuesPage !== prevState.issuesPage)
    )
      this.loadIssues();
  }

  render() {
    console.log('render');
    const { repository, issues, loading, issueState, itemsPerPage, issuesPage } = this.state;
    console.log(issueState, itemsPerPage)
    // console.log(repoName);
    if (loading) {
      return <Loading>Carregando...</Loading>;
    }


    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssueHeader page={issuesPage}>
          <label htmlFor="issueState">Issue State</label>
          <select name="issueState" id="issueState" onChange={this.handleIssueState} defaultValue={issueState}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <label htmlFor="itemsPerPage">Items per page</label>
          <select name="itemsPerPage" id="itemsPerPage" onChange={this.handleItemsPerPage} defaultValue={itemsPerPage}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="25">25</option>
            <option value="30">30</option>
          </select>
          <button disabled={issuesPage === 1} onClick={this.btnPriorPageClick}>Prior Page</button>
          <span>{issuesPage}</span>
          <button onClick={this.btnNextPageClick}>Next Page</button>
        </IssueHeader>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  {/** utiliza o a href pq eu um link externo */}
                  <a href={issue.html_url}>{issue.title}</a>
                  {/** LABLES */
                    issue.labels.map(label => (
                      <span key={String(label.id)}>{label.name}</span>
                    ))}
                  <p>{issue.user.login}</p>
                </strong>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
// export default function Repository({ match }) {
//   return <h1>Repository :{decodeURIComponent(match.params.repository)}</h1>;
// }
