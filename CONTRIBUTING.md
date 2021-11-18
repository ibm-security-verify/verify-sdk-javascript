# Contributing

Review the following guidelines for submitting questions, issues, or changes to this repository.

## Coding Style

The source code adheres to [Google Javascript](https://google.github.io/styleguide/jsguide.html) and corresponndingly enforced by [eslint](https://github.com/google/eslint-config-google). Ensure to:

1. Use promises/async functions
2. Run `npm run codecheck` and fix errors
3. Have proper syntax documentation and examples

## Issues and Questions

If you encounter an issue, have a question or want to suggest an enhancement to the IBM Security Verify SDK, you are welcome to submit a [request](https://github.com/ibm-security-verify/verify-sdk-javascript/issues).
Before that, please search for similar issues. It's possible somebody has encountered this issue already.

## Pull Requests

If you want to contribute to the repository, here's a quick guide:

1. Fork the repository
2. Create a feature or bugfix branch on your forked repository
3. Develop and test your code changes:
    * Follow the coding style as documented above and validate it with eslint.
    * Please add one or more tests to validate your changes.
4. Make sure everything builds/tests cleanly.
5. Commit your changes.
6. [Rebase](http://git-scm.com/book/en/Git-Branching-Rebasing) your local
   changes against the `main` branch.
7. Push to your fork's branch and submit a pull request to the `main` branch.


## Generating documentation

To generate the HTML docs for an SDK component, run `jsdoc` in the directory containing the projects file of the component. Then view the docs in the `verify-sdk-docs/javascript/<component>/docs` directory:

```
open index.html
```


## Additional Resources

* [General GitHub documentation](https://help.github.com/)
* [GitHub pull request documentation](https://help.github.com/send-pull-requests/)


# Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
   have the right to submit it under the open source license
   indicated in the file; or

(b) The contribution is based upon previous work that, to the best
   of my knowledge, is covered under an appropriate open source
   license and I have the right under that license to submit that
   work with modifications, whether created in whole or in part
   by me, under the same open source license (unless I am
   permitted to submit under a different license), as indicated
   in the file; or

(c) The contribution was provided directly to me by some other
   person who certified (a), (b) or (c) and I have not modified
   it.

(d) I understand and agree that this project and the contribution
   are public and that a record of the contribution (including all
   personal information I submit with it, including my sign-off) is
   maintained indefinitely and may be redistributed consistent with
   this project or the open source license(s) involved.
