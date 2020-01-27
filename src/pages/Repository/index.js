import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Loading, Owner, IssueList, Filter, Pagination } from './styles';
import api from '../../services/api';

import Container from '../../components/Container';

export default class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    repoName: '',
    param: 'all',
    cont: 1,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    // as duas serão executadas ao mesmo tempo
    // com a desestruturação, é criado duas constantes de acordo com as posições
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
      repoName,
    });
  }

  async requestWithFilter(param) {
    const { repoName } = this.state;
    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: param,
        per_page: 5,
      },
    });
    this.setState({
      issues: response.data,
      param,
      cont: 1,
    });
  }

  async previousPage() {
    const { cont, param, repoName } = this.state;

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: param,
        per_page: 5,
        page: cont - 1,
      },
    });
    this.setState({
      issues: response.data,
      cont: cont - 1,
    });
  }

  async nextPage() {
    const { cont, param, repoName } = this.state;

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: param,
        per_page: 5,
        page: cont + 1,
      },
    });
    this.setState({
      issues: response.data,
      cont: cont + 1,
    });
  }

  render() {
    const { repository, issues, loading, cont } = this.state;

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

        <IssueList>
          <Filter>
            <button type="button" onClick={() => this.requestWithFilter('all')}>
              Todas
            </button>
            <button
              type="button"
              onClick={() => this.requestWithFilter('open')}
            >
              Abertas
            </button>
            <button
              type="button"
              onClick={() => this.requestWithFilter('closed')}
            >
              Fechadas
            </button>
          </Filter>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pagination>
          <button
            type="button"
            onClick={() => this.previousPage()}
            disabled={cont === 1}
          >
            Página anterior
          </button>
          <span>{cont}</span>
          <button type="button" onClick={() => this.nextPage()}>
            Próxima página
          </button>
        </Pagination>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
