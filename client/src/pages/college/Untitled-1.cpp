#include <bits/stdc++.h>
using namespace std;

class SuffixAutomaton {
public:
    struct State {
        int len, link;
        map<char, int> next;
    };

    vector<State> st;
    int last;

    SuffixAutomaton() {
        st.push_back({0, -1});
        last = 0;
    }

    void extend(char c) {
        int cur = st.size();
        st.push_back({st[last].len + 1, -1});
        int p = last;
        while (p != -1 && !st[p].next.count(c)) {
            st[p].next[c] = cur;
            p = st[p].link;
        }
        if (p == -1) {
            st[cur].link = 0;
        } else {
            int q = st[p].next[c];
            if (st[p].len + 1 == st[q].len) {
                st[cur].link = q;
            } else {
                int clone = st.size();
                st.push_back({st[p].len + 1, st[q].link, st[q].next});
                while (p != -1 && st[p].next[c] == q) {
                    st[p].next[c] = clone;
                    p = st[p].link;
                }
                st[q].link = st[cur].link = clone;
            }
        }
        last = cur;
    }

    long long countDistinctSubstrings() {
        long long total = 0;
        for (int i = 1; i < (int)st.size(); i++) {
            total += (st[i].len - st[st[i].link].len);
        }
        return total;
    }
};

vector<int> countSubstring(int Q, vector<char>& Query) {
    SuffixAutomaton automaton;
    string s = "";
    vector<int> ans;

    for (char q : Query) {
        if (q == '*') {
            ans.push_back(automaton.countDistinctSubstrings());
        } else if (q == '-') {
            if (!s.empty()) {
                s.pop_back();
                automaton = SuffixAutomaton(); // Rebuild automaton
                for (char c : s) automaton.extend(c);
            }
        } else {
            s += q;
            automaton.extend(q);
        }
    }

    return ans;
}

int main() {
    int Q;
    cin >> Q;
    vector<char> Query(Q);
    for (int i = 0; i < Q; i++) cin >> Query[i];

    vector<int> result = countSubstring(Q, Query);
    for (int x : result) cout << x << " ";
    cout << endl;

    return 0;
}