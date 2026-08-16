import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { hasError: boolean };

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Noum List] UI error", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="error-screen" role="alert">
        <div className="error-screen-card">
          <span className="error-screen-mark">!</span>
          <p className="eyebrow">Noum List</p>
          <h1>تعذر تحميل مساحة العمل</h1>
          <p>حدث خطأ غير متوقع. بياناتك المحلية لم تُحذف. أعد تحميل الصفحة للمتابعة.</p>
          <button className="primary-button" type="button" onClick={this.handleReload}>إعادة تحميل</button>
        </div>
      </main>
    );
  }
}
