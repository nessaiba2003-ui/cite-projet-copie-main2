import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-10 w-10 text-red-600" aria-hidden />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Une erreur est survenue
          </h1>
          <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">
            {this.state.error?.message ||
              'Le chargement de cette page a échoué. Veuillez réessayer.'}
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={this.handleReset}>Retour à l&apos;accueil</Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Recharger
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
